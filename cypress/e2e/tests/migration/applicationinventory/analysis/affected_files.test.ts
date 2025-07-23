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
} from "../../../../../utils/utils";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { CredentialType, UserCredentials } from "../../../../types/constants";
import { AppIssue } from "../../../../types/types";
let applicationsList: Array<Analysis> = [];
let source_credential: CredentialsSourceControlUsername;
let maven_credential: CredentialsMaven;

describe(["@tier2"], "Affected files validation", () => {
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

    it("Affected files validation with source analysis on bookserver app", function () {
        // Automate bug https://issues.redhat.com/browse/MTA-1628
        const application = new Analysis(
            getRandomApplicationData("affected_files_on_bookserverapp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["affected_files_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.validateIssues(this.analysisData["affected_files_on_bookserverapp"]["issues"]);
        this.analysisData["affected_files_on_bookserverapp"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    it("Affected files validation with source analysis on tackle-testapp app", function () {
        // Automate bug https://issues.redhat.com/browse/MTA-1600
        const application = new Analysis(
            getRandomApplicationData("affected_files_on_tackleTestapp", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["affected_files_on_tackleTestapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.validateIssues(this.analysisData["affected_files_on_tackleTestapp"]["issues"]);
        this.analysisData["affected_files_on_tackleTestapp"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    it("Affected files validation with source+deps analysis on tackle-testapp app", function () {
        // Automate bug https://issues.redhat.com/browse/MTA-1622
        const application = new Analysis(
            getRandomApplicationData("affected_files_on_tackleTestapp_deps", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["affected_files_on_tackleTestapp_deps"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.manageCredentials(source_credential.name, maven_credential.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.validateIssues(
            this.analysisData["affected_files_on_tackleTestapp_deps"]["issues"]
        );
        this.analysisData["affected_files_on_tackleTestapp_deps"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    // Automates Bug MTA-4024, MTA-4025, MTA-4026 and MTA-4027
    it("Affected files validation with source+deps analysis on coolStore app", function () {
        const application = new Analysis(
            getRandomApplicationData("affected_files_on_coolStoreApp", {
                sourceData: this.appData["coolstore-app"],
            }),
            getRandomAnalysisData(this.analysisData["affected_files_on_coolStore_deps"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.verifyEffort(this.analysisData["affected_files_on_coolStore_deps"]["effort"]);
        application.validateIssues(this.analysisData["affected_files_on_coolStore_deps"]["issues"]);
        this.analysisData["affected_files_on_coolStore_deps"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationsList);
        source_credential.delete();
    });
});
