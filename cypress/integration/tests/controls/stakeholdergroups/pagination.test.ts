/// <reference types="cypress" />

import {
    login,
    clickByText,
    selectItemsPerPage,
    deleteTableRows,
    preservecookies,
    hasToBeSkipped,
    createMultipleStakeholderGroups,
    deleteAllStakeholderGroups,
} from "../../../../utils/utils";
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

describe("Stakeholder groups pagination validations", { tags: "@tier3" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        //Delete pre-existing data
        deleteAllStakeholderGroups();
        // Create 11 rows
        createMultipleStakeholderGroups(11);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete the stakeholder groups created before the tests
        deleteAllStakeholderGroups();
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
