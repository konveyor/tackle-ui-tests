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
    login,
    getRandomApplicationData,
    getRandomAnalysisData,
    writeMavenSettingsFile,
    resetURL,
    deleteByList,
    checkSuccessAlert,
} from "../../../../../utils/utils";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import {
    AnalysisStatuses,
    CredentialType,
    UserCredentials,
    SEC,
} from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../../../../models/administration/credentials/credentialsSourceControlKey";
import { infoAlertMessage } from "../../../../views/common.view";
import { Application } from "../../../../models/migration/applicationinventory/application";
let source_credential;
let maven_credential;
let applicationsList: Array<Analysis> = [];

describe(["@tier1"], "Source Analysis", () => {
    before("Login", function () {
        login();

        // Create source Credentials
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();

        // Create Maven credentials
        maven_credential = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, null, true)
        );
        maven_credential.create();
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

    afterEach("Reset url", function () {
        Application.open(100, true);
    });

    it("Source + dependencies analysis on tackletest app", function () {
        // Source code analysis require both source and maven credentials
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+dependencies", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_tackletestapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it("Bug MTA-1664:Source + dependencies analysis on daytrader app", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-721
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_Source+dependencies", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it("Analysis on daytrader app with maven credentials", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-751
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_MavenCreds", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(null, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it("Source Analysis on tackle testapp", function () {
        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_enableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it("Analysis on tackle test app with ssh credentials", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-707
        const scCredsKey = new CredentialsSourceControlKey(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.sourcePrivateKey
            )
        );
        scCredsKey.create();
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_sshCreds", {
                sourceData: this.appData["tackle-testapp-ssh"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_enableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(scCredsKey.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it("Source Analysis on tackle testapp for svn repo type", function () {
        // For tackle test app source credentials are required.
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_svnRepo", {
                sourceData: this.appData["tackle-testapp-svn"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_enableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it("Analysis for known Open Source libraries on tackleTest app", function () {
        // Source code analysis require both source and maven credentials
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+knownLibraries", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_openSourceLibraries"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it("Automated tagging using Source Analysis on tackle testapp", function () {
        // Automates Polarion MTA-208
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source_autoTagging", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_enableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.applicationDetailsTab("Tags");
        application.tagAndCategoryExists(
            this.analysisData["analysis_for_enableTagging"]["techTags"]
        );
        application.closeApplicationDetails();
    });

    it("Disable Automated tagging using Source Analysis on tackle testapp", function () {
        // Automates Polarion MTA-307
        const application = new Analysis(
            getRandomApplicationData("bookserverApp_Disable_autoTagging", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_disableTagging"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.applicationDetailsTab("Tags");
        cy.get("h2", { timeout: 5 * SEC }).should("contain", "No tags available");
    });

    it("Analysis for Konveyor example1 application", function () {
        // Automates https://github.com/konveyor/example-applications/tree/main/example-1
        const application = new Analysis(
            getRandomApplicationData("Example 1", {
                sourceData: this.appData["konveyor-exampleapp"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_on_example-1-app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });
});
