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

import * as data from "../../../../utils/data_utils";
import {
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    writeMavenSettingsFile,
} from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { GitConfiguration } from "../../../models/administration/repositories/git";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { CredentialType, UserCredentials } from "../../../types/constants";

let gitConfiguration = new GitConfiguration();
let source_credential: CredentialsSourceControlUsername;
let applicationsList: Analysis[] = [];

describe(["@tier2"], "Test secure and insecure git repository analysis", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Analysis on insecure git Repository(http) for tackle test app when insecure repository is allowed", function () {
        // test that when the insecure repository is enabled the analysis on a http repo should be completed successfully

        gitConfiguration.enableInsecureGitRepositories();

        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("Insecure_enabled_tackle_test_app", {
                sourceData: this.appData["tackle-testapp"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );

        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
    });

    it("Analysis on insecure git Repository(http) for tackle test app when insecure repository is not allowed", function () {
        // Negative test case, when the insecure repository is disabled the analysis on a http repo should fail

        gitConfiguration.disableInsecureGitRepositories();

        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("Insecure_disabled_tackle_test_app", {
                sourceData: this.appData["tackle-testapp"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );

        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Failed");
        application.openAnalysisDetails();
    });

    after("Perform test data clean up", () => {
        deleteByList(applicationsList);
        source_credential.delete();
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });
});
