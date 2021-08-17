/// <reference types="cypress" />

import {
    login,
    clickByText,
    selectItemsPerPage,
    click,
    deleteApplicationTableRows,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory, button, tdTag, trTag, deleteAction } from "../../../types/constants";
import { actionButton } from "../../../views/applicationinventory.view";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

import * as data from "../../../../utils/data_utils";
import * as commonView from "../../../views/common.view";

var applicationsList: Array<ApplicationInventory> = [];

describe("Application inventory pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        var rowsToCreate = 0;

        function createMultipleApplications(rowsToCreate: number): void {
            // Create multiple Applications
            for (let i = 0; i < rowsToCreate; i++) {
                const application = new ApplicationInventory(data.getFullName());
                application.create();
                applicationsList.push(application);
            }
        }

        // Get the current table row count and create appropriate test data rows
        selectItemsPerPage(100);
        cy.get(commonView.appTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get(".pf-c-table > tbody > tr")
                        .not(".pf-c-table__expandable-row")
                        .find("td[data-label=Name]")
                        .then(($rows) => {
                            var rowCount = $rows.length;
                            if (rowCount <= 10) {
                                rowsToCreate = 11 - rowCount;
                            }
                            if (rowsToCreate > 0) {
                                // Create multiple Applications
                                createMultipleApplications(rowsToCreate);
                            }
                        });
                } else {
                    rowsToCreate = 11;
                    // Create multiple Applications
                    createMultipleApplications(rowsToCreate);
                }
            });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors for Applications
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Delete the Applications created before the tests
        if (applicationsList.length > 0) {
            // Navigate to Application inventory tab
            clickByText(navMenu, applicationinventory);
            cy.wait("@getApplications");
            selectItemsPerPage(100);
            cy.wait(2000);

            applicationsList.forEach(function (application) {
                cy.get(".pf-c-table > tbody > tr")
                    .not(".pf-c-table__expandable-row")
                    .find("td[data-label=Name]")
                    .each(($rows) => {
                        if ($rows.text() === application.name) application.delete();
                    });
            });
        }
    });

    it("Navigation button validations", function () {
        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.wait("@getApplications");

        // Verify next buttons are enabled as there are more than 11 rows present
        cy.get(commonView.nextPageButton).each(($nextBtn) => {
            cy.wrap($nextBtn).should("not.be.disabled");
        });

        // Verify that previous buttons are disabled being on the first page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("be.disabled");
        });

        // Verify that navigation button to last page is enabled
        cy.get(commonView.lastPageButton).should("not.be.disabled");

        // Verify that navigation button to first page is disabled being on the first page
        cy.get(commonView.firstPageButton).should("be.disabled");

        // Navigate to next page
        cy.get(commonView.nextPageButton).eq(0).click();
        cy.wait("@getApplications");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(commonView.firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });

        // Select 20 items per page
        selectItemsPerPage(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
            });
    });

    it("Page number validations", function () {
        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Go to page number 2
        cy.get(commonView.pageNumInput).clear().type("2").type("{enter}");

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        // Issue - https://issues.redhat.com/browse/TACKLE-181
        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Navigate to last page
        cy.get(commonView.lastPageButton).click({ force: true });
        cy.wait(2000);

        // Delete all items of last page
        deleteApplicationTableRows();
        // cy.get(commonView.appTable)
        //     .get("tbody")
        //     .find(trTag)
        //     .not(".pf-c-table__expandable-row")
        //     .each(($tableRow) => {
        //         var name = $tableRow.find("td[data-label=Name]").text();

        //         cy.get(tdTag)
        //             .contains(name)
        //             .parent(tdTag)
        //             .parent(trTag)
        //             .within(() => {
        //                 click(actionButton);
        //             })
        //             .contains(button, deleteAction)
        //             .click();
        //         click(commonView.confirmButton);
        //         cy.wait(4000);
        //     });

        // Verify that page is re-directed to previous page
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });
    });
});
