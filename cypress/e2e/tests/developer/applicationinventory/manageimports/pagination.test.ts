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
    clickByText,
    selectItemsPerPage,
    click,
    importApplication,
    openManageImportsPage,
    deleteApplicationTableRows,
    preservecookies,
    hasToBeSkipped,
    selectUserPerspective,
    goToPage,
    goToLastPage,
    deleteAppImportsTableRows,
    deleteAllBusinessServices,
} from "../../../../../utils/utils";
import { navMenu } from "../../../../views/menu.view";
import {
    applicationInventory,
    button,
    tdTag,
    trTag,
    deleteAction,
} from "../../../../types/constants";
import { actionButton } from "../../../../views/applicationinventory.view";

import * as commonView from "../../../../views/common.view";

const filePath = "app_import/csv/";

const filesToImport = [
    "valid_application_rows.csv",
    "mandatory_and_empty_rows.csv",
    "non_existing_tags_business_service_rows.csv",
];

describe(["@tier3"], "Manage imports pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();

        // Delete all items of page
        deleteApplicationTableRows();
        deleteAllBusinessServices();

        // Navigate to Application inventory tab
        clickByText(navMenu, applicationInventory);
        cy.wait(5000);
        var rowsToCreate = 0;

        // Import multiple csv files
        function importMultipleFiles(num): void {
            for (let i = 0; i < rowsToCreate; i++) {
                var j = 0;
                if (i <= 2) j = i;
                importApplication(filePath + filesToImport[j]);
                cy.wait(2000);
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
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for Applications
        cy.intercept("GET", "/hub/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete all Data
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
    });

    it("Navigation button validations", function () {
        // Navigate to Application inventory tab and open manage imports page
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.get("@getApplications");
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
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.get("@getApplications");
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
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.get("@getApplications");
        openManageImportsPage();

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Go to page number 2
        goToPage(2);

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Back to page 1
        goToPage(1);
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        // Navigate to Application inventory tab and open manage imports page
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.get("@getApplications");
        openManageImportsPage();

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Navigate to last page
        goToLastPage();
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
