/// <reference types="cypress" />

import {
    login,
    clickByText,
    selectItemsPerPage,
    preservecookies,
    deleteApplicationTableRows,
    hasToBeSkipped,
    createMultipleApplications,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationInventory } from "../../../types/constants";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import * as commonView from "../../../views/common.view";

var applicationsList: Array<ApplicationInventory> = [];

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
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete the Applications created before the tests
        deleteApplicationTableRows();
    });

    it("Navigation button validations", function () {
        // Navigate to Application inventory tab
        clickByText(navMenu, applicationInventory);
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
        clickByText(navMenu, applicationInventory);
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
        // Navigate to Application inventory tab
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Navigate to last page
        cy.get(commonView.lastPageButton).click({ force: true });
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
