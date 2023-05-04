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
    selectItemsPerPage,
    preservecookies,
    hasToBeSkipped,
    createMultipleJobFunctions,
    deleteAllJobfunctions,
} from "../../../../../utils/utils";
import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    pageNumInput,
    prevPageButton,
} from "../../../../views/common.view";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";

describe(["@tier3"], "Job functions pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        // Get the current table row count and create appropriate test data rows
        selectItemsPerPage(100);
        cy.wait(2000);
        // Delete all pre-existing job functions
        deleteAllJobfunctions();
        // TODO: Implement creation of missing amount of job functions instead of deleting all and then creating again
        // Create 11 Job functions
        createMultipleJobFunctions(11);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for Job functions
        cy.intercept("GET", "/hub/jobfunctions*").as("getJobfunctions");
    });

    it("Navigation button validations", function () {
        Jobfunctions.openList();
        cy.wait("@getJobfunctions");

        // select 10 items per page
        selectItemsPerPage(10);

        // Verify next buttons are enabled as there are more than 11 rows present
        cy.get(nextPageButton).each(($nextBtn) => {
            cy.wrap($nextBtn).should("not.be.disabled");
        });

        // Verify that previous buttons are disabled being on the first page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("be.disabled");
        });

        // Verify that navigation button to last page is enabled
        cy.get(lastPageButton).should("not.be.disabled");

        // Verify that navigation button to first page is disabled being on the first page
        cy.get(firstPageButton).should("be.disabled");

        // Navigate to next page
        cy.get(nextPageButton).eq(0).click();
        cy.get("@getJobfunctions");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to Job functions tab
        Jobfunctions.openList();

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get("td[data-label=Name]").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPage(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label=Name]").then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Page number validations", function () {
        // Navigate to Job functions tab
        Jobfunctions.openList();

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Go to page number 2
        cy.get(pageNumInput).eq(0).clear().type("2").type("{enter}");

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });
    });

    after("Perform test data clean up", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete the Job functions created before the tests
        deleteAllJobfunctions();
    });
});
