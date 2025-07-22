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

import * as data from "../../../../../utils/data_utils";
import {
    deleteByList,
    exists,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../../utils/utils";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Issues } from "../../../../models/migration/dynamic-report/issues/issues";
import { AnalysisStatuses, CredentialType, UserCredentials } from "../../../../types/constants";

describe(["@tier2"], "Custom Rules in analyses", function () {
    const applications: Analysis[] = [];
    let tackleTestapp: Analysis;
    let sourceCredential: CredentialsSourceControlUsername;
    let mavenCredential: CredentialsMaven;

    before("Create test data", function () {
        login();
        cy.visit("/");
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

    it("Bug MTA-5199: Custom rule with administracionEfectivo application", function () {
        const app = new Analysis(
            getRandomApplicationData("customRule_administracionEfectivo"),
            getRandomAnalysisData(this.analysisData["administracionEfectivo_custom_rules"])
        );
        Application.open();
        applications.push(app);
        app.create();
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        Issues.openSingleApplication(app.name);
        exists("CUSTOM RULE");
    });

    it("Verify triggered rule", function () {
        const app = new Analysis(
            getRandomApplicationData("jee-example-app custom rule"),
            getRandomAnalysisData({
                source: "Upload a local binary",
                target: ["Application server migration to"],
                binary: ["jee-example-app-1.0.0.ear"],
                customRule: ["basic-custom-rule.yaml"],
            })
        );
        Application.open();
        applications.push(app);
        app.create();
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        Issues.openSingleApplication(app.name);
        exists("CUSTOM RULE");
    });

    // Automates Bug MTA-2001
    it("Bug MTA-4885: Verify triggered rule for dependency", function () {
        const app = new Analysis(
            getRandomApplicationData("tackle-testapp-custom-rules", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["tackle_test_app_custom_rules"])
        );
        tackleTestapp = app;
        Application.open();
        applications.push(app);
        app.create();
        app.manageCredentials(sourceCredential.name, mavenCredential.name);
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        Issues.openSingleApplication(app.name);
        exists("CUSTOM RULE FOR DEPENDENCIES");
    });

    // Automates Bug MTA-2000
    it("Verify triggered rule for javax.* package import", function () {
        Issues.openSingleApplication(tackleTestapp.name);
        exists("CUSTOM RULE for javax.* package import");
    });

    // Automates Bug MTA-2003
    it("Verify number of rules detected in uploaded yaml file", function () {
        tackleTestapp.verifyRulesNumber();
    });

    it.skip("Bug MTA-5779: Verify a file is not a valid YAML", function () {
        const app = new Analysis(
            getRandomApplicationData("tackle-testapp-fileNotValidXML", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["tackle_testapp_fileNotValidYaml"])
        );
        app.create();
        applications.push(app);
        // TODO: after the bug is fixed Verify that the uploaded yaml not valid
    });

    it("Python custom rules file analysis", function () {
        const app = new Analysis(
            getRandomApplicationData("python-app-custom-rules", {
                sourceData: this.appData["python-demo-app"],
            }),
            getRandomAnalysisData(this.analysisData["python_demo_application"])
        );
        applications.push(app);
        app.create();
        app.analyze();
        app.verifyAnalysisStatus(AnalysisStatuses.completed);
        // TODO: add assertion to check if rules fired once obtained a rules file
    });

    after("Clear test data", function () {
        deleteByList(applications);
        mavenCredential.delete();
        sourceCredential.delete();
    });
});
