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
    deleteAllStakeholders,
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import { SubversionConfiguration } from "../../../models/administrator/repositories/subversion";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { Analysis } from "../../../models/developer/applicationinventory/analysis";

let subversionConfiguration = new SubversionConfiguration();
let source_credential;

describe("Test an application form a subversion source", { tags: "@tier1" }, () => {
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

    after("Perform test data clean up", () => {
        if (hasToBeSkipped("@tier1")) return;
        // Delete the stakeholders created before the tests
        deleteAllStakeholders();
    });

    it("Enable Insecure subversion Repository", () => {
        SubversionConfiguration.open();
        subversionConfiguration.toggleInsecureSubversionRepositories();
    });

    it("Source code analysis on tackle testapp for svn repo type", function () {
        const application = new Analysis(
            getRandomApplicationData({ sourceData: this.appData[5] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, "None");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
    });

    it("Disable insecure subversion Repository", () => {
        SubversionConfiguration.open();
        subversionConfiguration.toggleInsecureSubversionRepositories();
    });

    it("Source code analysis on tackle testapp for svn repo type", function () {
        const application = new Analysis(
            getRandomApplicationData({ sourceData: this.appData[5] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, "None");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
    });
});
