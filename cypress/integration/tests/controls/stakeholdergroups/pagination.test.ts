/// <reference types="cypress" />

import { login, clickByText, selectItemsPerPage, deleteTableRows } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, stakeholdergroups } from "../../../types/constants";

import { Stakeholdergroups } from "../../../models/stakeholdergroups";

import * as data from "../../../../utils/data_utils";
import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    pageNumInput,
    prevPageButton,
    appTable,
} from "../../../views/common.view";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];

describe("Stakeholder groups pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        function createMultipleStakeholdergroups(num): void {
            for (let i = 0; i < num; i++) {
                const stakeholdergroup = new Stakeholdergroups(data.getCompanyName());
                stakeholdergroup.create();
                stakeholdergroupsList.push(stakeholdergroup);
            }
        }
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
                            // Create multiple stakeholder groups
                            createMultipleStakeholdergroups(rowsToCreate);
                        }
                    });
                } else {
                    rowsToCreate = 11;
                    // Create multiple stakeholder groups
                    createMultipleStakeholdergroups(rowsToCreate);
                }
            });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder groups created before the tests
        if (stakeholdergroupsList.length > 0) {
            // Navigate to stakeholder groups tab
            clickByText(navMenu, controls);
            clickByText(navTab, stakeholdergroups);
            cy.wait("@getStakeholdergroups");
            selectItemsPerPage(100);
            cy.wait(2000);

            stakeholdergroupsList.forEach(function (stakeholdergroup) {
                cy.get("td[data-label=Name]").each(($rows) => {
                    if ($rows.text() === stakeholdergroup.name) stakeholdergroup.delete();
                });
            });
        }
    });

    it("Navigation button validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.wait("@getStakeholdergroups");

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
        cy.wait("@getStakeholdergroups");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

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
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

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

    it("Last page item(s) deletion, impact on page reload validation", function () {
        // Issue - https://issues.redhat.com/browse/TACKLE-155
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Navigate to last page
        cy.get(lastPageButton).click();
        cy.wait(2000);

        // Delete all items of last page
        deleteTableRows();

        // Verify that page is re-directed to previous page
        cy.get("td[data-label=Name]").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });
    });
});
