/// <reference types="cypress" />

import {
    login,
    clickByText,
    selectItemsPerPage,
    preservecookies,
    hasToBeSkipped,
    createMultipleJobfunctions,
    deleteAllJobfunctions,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, jobfunctions } from "../../../types/constants";

import { Jobfunctions } from "../../../models/jobfunctions";

import * as data from "../../../../utils/data_utils";
import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    pageNumInput,
    prevPageButton,
    appTable,
} from "../../../views/common.view";

var jobfunctionsList: Array<Jobfunctions> = [];

describe("Job functions pagination validations", { tags: "@tier3" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();

        // Navigate to Job functions tab
        var rowsToCreate = 0;

        // Get the current table row count and create appropriate test data rows
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(appTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get("td[data-label=Name]").then(($rows) => {
                        var rowCount = $rows.length;
                        if (rowCount <= 10) {
                            rowsToCreate = 11 - rowCount;
                        }
                        if (rowsToCreate > 0) {
                            // Create multiple Job functions
                            createMultipleJobfunctions(rowsToCreate);
                        }
                    });
                } else {
                    rowsToCreate = 11;
                    // Create multiple Job functions
                    createMultipleJobfunctions(rowsToCreate);
                }
            });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for Job functions
        cy.intercept("GET", "/api/controls/job-function*").as("getJobfunctions");
    });

    after("Perform test data clean up", function () {
        // Delete the Job functions created before the tests
        deleteAllJobfunctions();
    });

    it("Navigation button validations", function () {
        // Navigate to Job functions tab
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
        cy.wait("@getJobfunctions");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.wait("@getJobfunctions");

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
        cy.wait("@getJobfunctions");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to Job functions tab
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
        cy.wait("@getJobfunctions");

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
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
        cy.wait("@getJobfunctions");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Go to page number 2
        cy.get(pageNumInput).clear().type("2").type("{enter}");

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });
    });
});
