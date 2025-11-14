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

import { getRandomCredentialsData } from "../../../../../utils/data_utils";
import {
    checkSuccessAlert,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
} from "../../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../../models/migration/task-manager/task-manager";
import { CredentialType, TaskKind, TaskStatus, UserCredentials } from "../../../../types/constants";
import { AppIssue } from "../../../../types/types";
import { infoAlertMessage } from "../../../../views/common.view";
let applicationsList: Array<Analysis> = [];
let credentialsList: Array<CredentialsSourceControlUsername> = [];
let application: Analysis;

describe(["@tier0"], "Source Analysis without credentials", () => {
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
        cy.visit("/");
    });

    it("Creating source control credentials with username/password", function () {
        let scCredsUsername = new CredentialsSourceControlUsername(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.usernamePassword)
        );
        scCredsUsername.create();
        credentialsList.push(scCredsUsername);
    });

    it("Source Analysis on bookserver app and its issues validation", function () {
        // For source code analysis application must have source code URL git or svn
        application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        checkSuccessAlert(infoAlertMessage, `Submitted for analysis`);
        application.verifyAnalysisStatus("Completed");
        application.validateIssues(this.analysisData["source_analysis_on_bookserverapp"]["issues"]);
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    it("Source + dependency Analysis on bookserver app and its issues validation", function () {
        // For source code analysis application must have source code URL git or svn
        application = new Analysis(
            getRandomApplicationData("Dep_bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_plus_dep_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        application.analyze();
        checkSuccessAlert(infoAlertMessage, `Submitted for analysis`);
        application.verifyAnalysisStatus("Completed");
        application.validateIssues(
            this.analysisData["source_plus_dep_analysis_on_bookserverapp"]["issues"]
        );
        this.analysisData["source_plus_dep_analysis_on_bookserverapp"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    it("Check the bookserver task status on task manager page", function () {
        TaskManager.verifyTaskStatus(application.name, TaskKind.analyzer, TaskStatus.succeeded);
        TaskManager.verifyTaskStatus(
            application.name,
            TaskKind.techDiscovery,
            TaskStatus.succeeded
        );
        TaskManager.verifyTaskStatus(
            application.name,
            TaskKind.languageDiscovery,
            TaskStatus.succeeded
        );
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
        deleteByList(credentialsList);
    });
});
