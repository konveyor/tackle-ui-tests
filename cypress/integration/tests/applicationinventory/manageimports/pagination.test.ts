/// <reference types="cypress" />

import {
    login,
    clickByText,
    selectItemsPerPage,
    click,
    importApplication,
    openManageImportsPage,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory, button, tdTag, trTag, deleteAction } from "../../../types/constants";
import { actionButton } from "../../../views/applicationinventory.view";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

import * as commonView from "../../../views/common.view";
import { BusinessServices } from "../../../models/businessservices";

const businessService = new BusinessServices("Finance and HR");
const filePath = "app_import/";
var applicationsList: Array<ApplicationInventory> = [];
const filesToImport = [
    "valid_application_rows.csv",
    "mandatory_and_empty_rows.csv",
    "non_existing_tags_business_service_rows.csv",
];

describe("Manage imports pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create business service
        businessService.create();

        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait(5000);
        var rowsToCreate = 0;

        // Import multiple csv files
        function importMultipleFiles(num): void {
            for (let i = 0; i < rowsToCreate; i++) {
                importApplication(filePath + filesToImport[i]);
            }
        }

        // Get the current table row count and create appropriate test data rows
        openManageImportsPage();
        selectItemsPerPage(100);
        cy.get(commonView.appTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get(".pf-c-table > tbody > tr")
                        .not(".pf-c-table__expandable-row")
                        .find("td[data-label='File name']")
                        .then(($rows) => {
                            var rowCount = $rows.length;
                            if (rowCount <= 10) {
                                rowsToCreate = 11 - rowCount;
                            }
                            if (rowsToCreate > 0) {
                                importMultipleFiles(rowsToCreate);
                            }
                        });
                } else {
                    rowsToCreate = 11;
                    importMultipleFiles(rowsToCreate);
                }
            });

        // Create objects for imported apps
        const appsImported = ["Import-app-1", "Import-app-2", "Import-app-5", "Import-app-6"];
        appsImported.forEach(function (appName) {
            const importedApp = new ApplicationInventory(appName);
            applicationsList.push(importedApp);
        });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors for Applications
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Delete the business service
        businessService.delete();

        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        selectItemsPerPage(100);
        cy.wait(2000);

        // Delete the Applications created before the tests
        applicationsList.forEach(function (application) {
            cy.get(".pf-c-table > tbody > tr")
                .not(".pf-c-table__expandable-row")
                .find("td[data-label=Name]")
                .each(($rows) => {
                    if ($rows.text() === application.name) application.delete();
                });
        });
    });

    it("Navigation button validations", function () {
        // Navigate to Application inventory tab and open manage imports page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();

        // select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

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
        cy.wait(2000);

        // Verify that previous buttons are enabled after moving to next page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(commonView.firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to Application inventory tab and open manage imports page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label='File name']")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });

        // Select 20 items per page
        selectItemsPerPage(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label='File name']")
            .then(($rows) => {
                cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
            });
    });

    it("Page number validations", function () {
        // Navigate to Application inventory tab and open manage imports page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();

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
        // Navigate to Application inventory tab and open manage imports page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Navigate to last page
        cy.get(commonView.lastPageButton).click({ force: true });
        cy.wait(2000);

        // Delete all items of last page
        cy.get(commonView.appTable)
            .get("tbody")
            .find(trTag)
            .not(".pf-c-table__expandable-row")
            .each(($tableRow) => {
                var name = $tableRow.find("td[data-label='File name']").text();
                cy.get(tdTag)
                    .contains(name)
                    .parent(trTag)
                    .within(() => {
                        click(actionButton);
                    })
                    .contains(button, deleteAction)
                    .click();
                click(commonView.confirmButton);
                cy.wait(4000);
            });

        // Verify that page is re-directed to previous page
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label='File name']")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });
    });
});
