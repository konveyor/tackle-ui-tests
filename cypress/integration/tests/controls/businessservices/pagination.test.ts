/// <reference types="cypress" />

import {
    login,
    clickByText,
    selectItemsPerPage,
    deleteTableRows,
    preservecookies,
    hasToBeSkipped,
    createMultipleBusinessServices,
    deleteAllBusinessServices,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, businessServices } from "../../../types/constants";
import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    pageNumInput,
    prevPageButton,
} from "../../../views/common.view";

describe("Business services pagination validations", { tags: "@tier3" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        // Clear pre-existing data
        deleteAllBusinessServices();
        // Create 11 rows
        createMultipleBusinessServices(11);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for business services
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete the business services created before the tests
        deleteAllBusinessServices();
    });

    it("Navigation button validations", function () {
        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
        cy.wait("@getBusinessService");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.wait("@getBusinessService");

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
        cy.wait("@getBusinessService");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
        cy.wait("@getBusinessService");

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
        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
        cy.wait("@getBusinessService");

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
        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
        cy.wait("@getBusinessService");

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
