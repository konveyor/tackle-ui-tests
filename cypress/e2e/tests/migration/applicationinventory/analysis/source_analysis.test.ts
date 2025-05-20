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
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    writeMavenSettingsFile,
} from "../../../../../utils/utils";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlKey } from "../../../../models/administration/credentials/credentialsSourceControlKey";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import {
    AnalysisStatuses,
    CredentialType,
    MIN,
    SEC,
    UserCredentials,
} from "../../../../types/constants";
import { AppIssue } from "../../../../types/types";
let source_credential: CredentialsSourceControlUsername;
let source_credential_withHash: CredentialsSourceControlUsername;
let maven_credential: CredentialsMaven;
let applicationsList: Array<Analysis> = [];

describe(["@tier2"], "Source Analysis", () => {
    before("Login", function () {
        login();
        cy.visit("/");

        // Create source Credentials
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();

        // Create source Credentials with # in password
        source_credential_withHash = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential_withHash.password = "#" + source_credential_withHash.password;
        source_credential_withHash.create();

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
        cy.intercept("DELETE", "/hub/application*").as("deleteApplication");
        cy.visit("/");
    });

    it(["@tier1"], "Source + dependencies analysis on tackletest app", function () {
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
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        // Daytrader app take more than 20 min to analyze
        application.verifyAnalysisStatus("Completed", 30 * MIN);
        application.verifyEffort(
            this.analysisData["source+dep_analysis_on_daytrader-app"]["effort"]
        );
        application.validateIssues(
            this.analysisData["source+dep_analysis_on_daytrader-app"]["issues"]
        );
        // Automate bug https://issues.redhat.com/browse/MTA-2006
        this.analysisData["source+dep_analysis_on_daytrader-app"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
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
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(null, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    it(["@tier1"], "Source Analysis on tackle testapp", function () {
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
        application.manageCredentials(source_credential.name, null);
        application.analyze();
        application.verifyAnalysisStatus("Completed", 30 * MIN);
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
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed", 30 * MIN);
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
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        // Polarion TC 406
        application.verifyEffort(this.analysisData["analysis_on_example-1-app"]["effort"]);
    });

    it("JWS6 target Source + deps analysis on tackletest app", function () {
        // Source code analysis require both source and maven credentials
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+dependencies_jws6", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["jws6_source+dep_analysis_on_tackletestapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["jws6_source+dep_analysis_on_tackletestapp"]["effort"]
        );
    });

    it("Bug MTA-4412: Bug MTA-5212  Openjdk17 Source + dependencies analysis on tackletest app", function () {
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source+dependencies_openjdk17", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(
                this.analysisData["openJDK17_source+dep_analysis_on_tackletestapp"]
            )
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["openJDK17_source+dep_analysis_on_tackletestapp"]["effort"]
        );
    });

    it("Bug MTA-4417: OpenJDK21 Source + dependencies analysis on daytrader app", function () {
        const application = new Analysis(
            getRandomApplicationData("dayTraderApp_Source+dependencies_openjdk21", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["openJDK21_source+dep_analysis_on_dayTrader"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed", 30 * MIN);
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
        application.create();
        application.manageCredentials(null, maven_credential.name);
        applicationsList.push(application);
        cy.wait("@getApplication");
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
        application.create();
        applicationsList.push(application);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(this.analysisData["tackle-testapp-public-4-targets"]["effort"]);
    });

    // Automates customer bug MTA-2973
    it("Source analysis on tackle app public with custom rule", function () {
        const applicationsList = [];

        for (let i = 0; i < 2; i++) {
            const application = new Analysis(
                getRandomApplicationData("tackle-public-customRule", {
                    sourceData: this.appData["tackle-testapp-public"],
                }),
                getRandomAnalysisData(this.analysisData["tackle-testapp-public-customRule"])
            );
            applicationsList.push(application);
        }

        // Analyze an application
        const analyzeApplication = (application, credentials) => {
            application.create();
            if (credentials) application.manageCredentials(null, credentials.name);
            application.analyze();
            application.verifyAnalysisStatus("Completed");
            application.validateIssues(
                this.analysisData["tackle-testapp-public-customRule"]["issues"]
            );
        };

        // Analyze application with Maven credentials
        analyzeApplication(applicationsList[0], maven_credential);

        // Analyze application without Maven credentials
        analyzeApplication(applicationsList[1], null);
    });

    it("Bug MTA-3701: Source analysis on tackle app with hash in Password", function () {
        const application = new Analysis(
            getRandomApplicationData("tackleTestApp_Source", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["tackleTestApp_Source"])
        );

        // Analysis application with source credential created with hash
        application.create();
        application.manageCredentials(source_credential_withHash.name);
        applicationsList.push(application);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    after("Perform test data clean up", function () {
        login();
        cy.visit("/");
        Application.open(true);
        deleteByList(applicationsList);
        if (source_credential) {
            source_credential.delete();
        }
        if (maven_credential) {
            maven_credential.delete();
        }
        if (source_credential_withHash) {
            source_credential_withHash.delete();
        }
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });
});
