/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    exists,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../../utils/utils";
import { AnalysisStatuses, CredentialType, UserCredentials } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Issues } from "../../../../models/migration/dynamic-report/issues/issues";
import { deleteByList } from "../../../../../utils/utils";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { Application } from "../../../../models/migration/applicationinventory/application";

describe(["@tier2"], "Bug MTA-2015: Custom Rules in analyses", function () {
    const applications: Analysis[] = [];
    let sourceCredential: CredentialsSourceControlUsername;
    let mavenCredential: CredentialsMaven;

    before("Create test data", function () {
        login();

        sourceCredential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        sourceCredential.create();

        mavenCredential = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, null, true)
        );
        mavenCredential.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Verify triggered rule", function () {
        const app = new Analysis(
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(
                this.analysisData["upload_binary_analysis_on_jee_app_custom_rules"]
            )
        );
        applications.push(app);
        app.create();
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        Issues.openSingleApplication(app.name);
        exists("CUSTOM RULE");
    });

    // Automates Bug MTA-2001
    it("Verify triggered rule for dependency", function () {
        const app = new Analysis(
            getRandomApplicationData("tackle-testapp-custom-rules", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["tackle_test_app_custom_rules"])
        );
        applications.push(app);
        app.create();
        app.manageCredentials(sourceCredential.name, mavenCredential.name);
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        Issues.openSingleApplication(app.name);
        exists("CUSTOM RULE FOR DEPENDENCIES");
    });

    // Automates Bug MTA-2015
    it("Bug MTA-2015: Custom rule with administracionEfectivo application", function () {
        const app = new Analysis(
            getRandomApplicationData("customRule_administracionEfectivo"),
            getRandomAnalysisData(this.analysisData["administracionEfectivo_custom_rules"])
        );
        applications.push(app);
        app.create();
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        Issues.openSingleApplication(app.name);
        exists("CUSTOM RULE");
    });

    afterEach("Reset state", function () {
        Application.open(true);
    });

    after("Clear test data", function () {
        deleteByList(applications);
        mavenCredential.delete();
        sourceCredential.delete();
    });
});
