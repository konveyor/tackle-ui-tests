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
    clickByText,
    verifySortAsc,
    verifySortDesc,
} from "../../../utils/utils";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { analysis } from "../../types/constants";
import { navTab } from "../../views/menu.view";
import { Report } from "../../models/developer/applicationinventory/reportPage";

describe("Report Page's Sort Validation", { tags: "@tier2" }, () => {
    const report = new Report();

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        deleteApplicationTableRows();
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
        deleteApplicationTableRows();
    });

    it("Sort by Name validation test using Upload Binary Analysis", function () {
        const application: any = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData[9])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();

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
            getRandomAnalysisData(this.analysisData[9])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();

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
