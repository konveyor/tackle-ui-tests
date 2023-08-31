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
    clickWithinByText,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    resetURL,
    writeMavenSettingsFile,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import { SubversionConfiguration } from "../../../models/administration/repositories/subversion";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { button, CredentialType, SEC, UserCredentials } from "../../../types/constants";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { footer } from "../../../views/common.view";

let subversionConfiguration = new SubversionConfiguration();
let source_credential: CredentialsSourceControlUsername;
let applicationsList: Analysis[] = [];

describe(["@tier1"], "Test secure and insecure svn repository analysis", () => {
    before("Login", function () {
        login();
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

    // test that when the insecure repository is enabled, then the analysis on a http repo should be completed successfully
    it("Analysis on insecure subversion Repository(http) for tackle test app when insecure repository is allowed", function () {
        subversionConfiguration.enableInsecureSubversionRepositories();

        const application = new Analysis(
            getRandomApplicationData("Secure_enabled_tackle_test_app", {
                sourceData: this.appData["tackle-testapp-svn-insecure"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
    });

    // Negative test case, when the insecure repository is disabled, then the analysis on a http repo should fail
    it("Analysis on insecure subversion Repository(http) for tackle test app when insecure repository is not allowed", function () {
        subversionConfiguration.disableInsecureSubversionRepositories();

        const application = new Analysis(
            getRandomApplicationData("Secure_disabled_tackle_test_app", {
                sourceData: this.appData["tackle-testapp-svn-insecure"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Failed");
        application.openAnalysisDetails();
        clickWithinByText(footer, button, "Close");
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", () => {
        deleteByList(applicationsList);
        source_credential.delete();
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });
});
