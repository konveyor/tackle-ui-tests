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
    deleteByList,
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
import { Application } from "../../../../models/migration/applicationinventory/application";
import { AppIssue } from "../../../../types/types";
let source_credential: CredentialsSourceControlUsername;
let maven_credential: CredentialsMaven;
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
        Application.open(true);
    });

    it("Source + dependencies analysis on tackletest app", function () {
        // Source code analysis require both source and maven credentials
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+dependencies", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_tackletestapp"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["source+dep_analysis_on_tackletestapp"]["effort"]
        );
    });

    it("Source + dependencies analysis on daytrader app", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-721
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_Source+dependencies", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["source+dep_analysis_on_daytrader-app"]["effort"]
        );
    });

    it("Analysis on daytrader app with maven credentials", function () {
        // Automate bug https://issues.redhat.com/browse/TACKLE-751
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_MavenCreds", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
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
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
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
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.manageCredentials(scCredsKey.name, null);
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
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
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
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.applicationDetailsTab("Tags");
        application.tagAndCategoryExists(
            this.analysisData["analysis_for_enableTagging"]["techTags"]
        );
        application.closeApplicationDetails();
    });

    it("Bug MTA-3418: Disable Automated tagging using Source Analysis on tackle testapp", function () {
        // Automates Polarion MTA-307
        const application = new Analysis(
            getRandomApplicationData("bookserverApp_Disable_autoTagging", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_disableTagging"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(this.analysisData["analysis_for_disableTagging"]["effort"]);
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
        cy.wait(2 * SEC);
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        // Polarion TC 406
        application.verifyEffort(this.analysisData["analysis_on_example-1-app"]["effort"]);
    });

    it("Bug MTA-2916: JWS6 target Source + deps analysis on tackletest app", function () {
        // Source code analysis require both source and maven credentials
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+dependencies_jws6", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["jws6_source+dep_analysis_on_tackletestapp"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["jws6_source+dep_analysis_on_tackletestapp"]["effort"]
        );
    });

    it("Bug MTA-2916: Openjdk17 Source + dependencies analysis on tackletest app", function () {
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+dependencies_openjdk17", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(
                this.analysisData["openJDK17_source+dep_analysis_on_tackletestapp"]
            )
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["openJDK17_source+dep_analysis_on_tackletestapp"]["effort"]
        );
    });

    it("Bug MTA-2916: OpenJDK21 Source + dependencies analysis on daytrader app", function () {
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_Source+dependencies_openjdk21", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["openJDK21_source+dep_analysis_on_dayTrader"])
        );
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["openJDK21_source+dep_analysis_on_dayTrader"]["effort"]
        );
    });

    // Automates customer bug MTA-1785
    it("JDK<11 Source + dependencies analysis on tackle app public", function () {
        const application = new Analysis(
            getRandomApplicationData("tackle testapp public jdk 9", {
                sourceData: this.appData["tackle-testapp-public-jdk9"],
            }),
            getRandomAnalysisData(this.analysisData["jdk9_source_dep_analysis_on_tackletestapp"])
        );
        Application.open();
        application.create();
        application.manageCredentials(null, maven_credential.name);
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    // Automates bug MTA-3422
    it("4 targets source analysis on tackle app public", function () {
        const application = new Analysis(
            getRandomApplicationData("tackle-public-4-targets", {
                sourceData: this.appData["tackle-testapp-public"],
            }),
            getRandomAnalysisData(this.analysisData["tackle-testapp-public-4-targets"])
        );
        cy.wait(2 * SEC);
        Application.open();
        application.create();
        applicationsList.push(application);
        cy.wait(5 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(this.analysisData["tackle-testapp-public-4-targets"]["effort"]);
    });

    // Automates customer bug MTA-2973
    it("Bug MTA-3163: Source analysis on tackle app public with custom rule", function () {
        const applicationList = [
            new Analysis(
                getRandomApplicationData("tackle-public-customRule", {
                    sourceData: this.appData["tackle-testapp-public"],
                }),
                getRandomAnalysisData(this.analysisData["tackle-testapp-public-customRule"])
            ),
        ];

        // Analysis application with maven credential
        cy.wait(2 * SEC);
        Application.open();
        applicationList[0].create();
        applicationList[0].manageCredentials(null, maven_credential.name);
        applicationsList.push(applicationList[0]);
        cy.wait(5 * SEC);
        applicationList[0].analyze();
        applicationList[0].verifyAnalysisStatus("Completed");
        applicationList[0].validateIssues(
            this.analysisData["tackle-testapp-public-customRule"]["issues"]
        );
        this.analysisData["tackle-testapp-public-customRule"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                applicationList[0].validateAffected(currentIssue);
            }
        );

        // Analysis application without maven credential
        cy.wait(2 * SEC);
        Application.open();
        applicationList[1].create();
        applicationsList.push(applicationList[0]);
        cy.wait(5 * SEC);
        applicationList[1].analyze();
        applicationList[1].verifyAnalysisStatus("Completed");
        applicationList[1].validateIssues(
            this.analysisData["tackle-testapp-public-customRule"]["issues"]
        );
        this.analysisData["tackle-testapp-public-customRule"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                applicationList[1].validateAffected(currentIssue);
            }
        );
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });
});
