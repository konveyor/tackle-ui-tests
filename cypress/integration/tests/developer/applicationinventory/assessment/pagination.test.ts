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
    preservecookies,
    deleteApplicationTableRows,
    hasToBeSkipped,
    createMultipleApplications,
    selectUserPerspective,
    goToPage,
    goToLastPage,
} from "../../../../../utils/utils";
import { navMenu } from "../../../../views/menu.view";
import { applicationInventory } from "../../../../types/constants";
import * as commonView from "../../../../views/common.view";
import { Application } from "../../../../models/developer/applicationinventory/application";

let applicationsList: Array<Application> = [];

describe("Application inventory pagination validations", { tags: "@tier3" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();

        // Navigate to Application inventory tab, delete all and create 11 applications
        deleteApplicationTableRows();
        applicationsList = createMultipleApplications(11);
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

        // Delete the Applications created before the tests
        deleteApplicationTableRows();
    });

    it("Navigation button validations", function () {
        // Navigate to Application inventory tab
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplications");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.get("@getApplications");

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
        cy.get("@getApplications");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(commonView.firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to Application inventory tab
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
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
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Go to page number 2
        goToPage(2);

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Go back to page number 1
        goToPage(1);
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        // Navigate to Application inventory tab
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Navigate to last page
        goToLastPage();
        cy.wait(2000);

        // Delete all items of last page
        deleteApplicationTableRows(true);

        // Verify that page is re-directed to previous page
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });
    });
});
