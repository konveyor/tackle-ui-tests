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
    hasToBeSkipped,
    preservecookies,
    deleteApplicationTableRows,
    getRandomApplicationData,
    getRandomAnalysisData,
    resetURL,
    verifySortAsc,
    verifySortDesc,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Report } from "../../../../models/migration/applicationinventory/reportPage";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import * as data from "../../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../../types/constants";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";

describe("Report Page's Sort Validation", { tags: "@tier2" }, () => {
    const report = new Report();
    let source_credential;
    let maven_credential;

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        deleteApplicationTableRows();

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
            data.getRandomCredentialsData(CredentialType.maven, "None", true)
        );
        maven_credential.create();
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

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;
        deleteApplicationTableRows();
    });

    it("Sort by Name validation test using Upload Binary Analysis", function () {
        const application: any = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["analysis_and_incident_validation_camunda_app"])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();

        // Sort the Application by Name in Ascending order
        const unsortedList = report.getTableColumnData(application.appName);
        report.applySortAction("Name");
        cy.wait(2000);
        const afterAscSortList = report.getTableColumnData(application.appName);
        // verify that the application name rows are displayed in ascending order
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Application by Name in descending order
        report.applySortAction("Name");
        cy.wait(2000);
        const afterDescSortList = report.getTableColumnData(application.appName);
        // verify that the application name rows are displayed in descending order
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Sort by Story points test using Upload Binary Analysis", function () {
        const application: any = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["analysis_and_incident_validation_camunda_app"])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();

        // Sort the Application by Story points in Ascending order
        const unsortedList = report.getTableColumnData(application.storyPoints);
        report.applySortAction("Story Points");
        cy.wait(2000);
        const afterAscSortList = report.getTableColumnData(application.storyPoints);
        // verify that the application with story points rows are displayed in ascending order
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Application by Story points in descending order
        report.applySortAction("Story Points");
        cy.wait(2000);
        const afterDescSortList = report.getTableColumnData(application.storyPoints);
        // verify that the application with story points rows are displayed in descending order
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
