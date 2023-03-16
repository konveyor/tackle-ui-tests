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
    deleteAllBusinessServices,
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
    resetURL,
    writeMavenSettingsFile,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import { SubversionConfiguration } from "../../../models/administrator/repositories/subversion";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { Analysis } from "../../../models/developer/applicationinventory/analysis";

let subversionConfiguration = new SubversionConfiguration();
let source_credential;

describe("Test secure and insecure svn repository analysis", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        deleteApplicationTableRows();
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
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

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", () => {
        if (hasToBeSkipped("@tier1")) return;
        login();
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        source_credential.delete();
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });

    // test that when the insecure repository is enabled, then the analysis on a http repo should be completed successfully
    it("Analysis on insecure subversion Repository(http) for tackle test app when insecure repository is allowed", function () {
        // open the configuration page for subversion and enable insecure repo
        subversionConfiguration.enableInsecureSubversionRepositories();

        const application = new Analysis(
            getRandomApplicationData("Secure_enabled_tackle_test_app", {
                sourceData: this.appData[7],
            }),
            getRandomAnalysisData(this.analysisData[0])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, "None");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
    });

    // Negative test case, when the insecure repository is disabled, then the analysis on a http repo should fail
    it("Analysis on insecure subversion Repository(http) for tackle test app when insecure repository is not allowed", function () {
        // open the configuration page for subversion and disable insecure repo
        subversionConfiguration.disableInsecureSubversionRepositories();

        const application = new Analysis(
            getRandomApplicationData("Secure_disabled_tackle_test_app", {
                sourceData: this.appData[7],
            }),
            getRandomAnalysisData(this.analysisData[0])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, "None");
        application.analyze();
        application.verifyAnalysisStatus("Failed");
        application.openAnalysisDetails();
    });
});
