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
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import {
    AnalysisStatuses,
    CredentialType,
    MIN,
    SEC,
    UserCredentials,
} from "../../../../types/constants";
let sourceCredential: CredentialsSourceControlUsername;
let invalidSourceCredential: CredentialsSourceControlUsername;
let mavenCredential: CredentialsMaven;
let applicationsList: Array<Analysis> = [];

describe(["@tier2"], "Source Analysis", () => {
    before("Login", function () {
        login();
        cy.visit("/");

        // Create source Credentials
        sourceCredential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        sourceCredential.create();

        // Create invalid source Credentials
        invalidSourceCredential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                false
            )
        );
        invalidSourceCredential.create();

        // Create Maven credentials
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

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
        cy.intercept("DELETE", "/hub/application*").as("deleteApplication");
        cy.visit("/");
    });

    it(
        ["@tier1"],
        "Source + dependencies analysis on tackletest app with default credentials",
        function () {
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
            // analyze with no default creds
            application.analyze();
            application.verifyAnalysisStatus(AnalysisStatuses.failed);

            // analyze with inValid default source creds and valid maven creds
            invalidSourceCredential.setAsDefaultViaActionsMenu();
            mavenCredential.setAsDefaultViaActionsMenu();
            application.analyze();
            application.waitStatusChange(AnalysisStatuses.scheduled);
            application.verifyAnalysisStatus(AnalysisStatuses.failed);

            // analyze with valid default source and maven creds
            sourceCredential.setAsDefaultViaActionsMenu();
            application.analyze();
            application.waitStatusChange(AnalysisStatuses.scheduled);
            application.verifyAnalysisStatus(AnalysisStatuses.completed);

            // analyze after removing valid default source and maven creds
            sourceCredential.unsetAsDefaultViaActionsMenu();
            mavenCredential.unsetAsDefaultViaActionsMenu();
            application.analyze();
            application.waitStatusChange(AnalysisStatuses.failed);
        }
    );

    it("Bug MTA-3418: Disable Automated tagging using Source Analysis on bookServer app", function () {
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
        application.manageCredentials(sourceCredential.name, mavenCredential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(
            this.analysisData["openJDK17_source+dep_analysis_on_tackletestapp"]["effort"]
        );
    });

    it("OpenJDK21 Source + dependencies analysis on daytrader app", function () {
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
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
        sourceCredential.delete();
        invalidSourceCredential.delete();
        mavenCredential.delete();
        writeMavenSettingsFile(data.getRandomWord(5), data.getRandomWord(5));
    });
});
