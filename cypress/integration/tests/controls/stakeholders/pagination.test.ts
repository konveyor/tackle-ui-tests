/// <reference types="cypress" />

import { login, clickByText, selectItemsPerPage } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, stakeholders } from "../../../types/constants";

import { Stakeholders } from "../../../models/stakeholders";

import * as data from "../../../../utils/data_utils";
import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    prevPageButton,
} from "../../../views/common.view";

var stakeholdersList: Array<Stakeholders> = [];

describe("Stakeholder pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);

        var rowsToCreate = 0;

        // Get the current table row count and create appropriate test data rows for testing pagination
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get("td[data-label=Email]").then(($rows) => {
            var rowCount = $rows.length;
            if (rowCount <= 10) {
                rowsToCreate = 11 - rowCount;
            }
            // Create test data, only if the rows are insufficient (less than 11)
            if (rowsToCreate > 0) {
                // Create multiple stakeholders
                for (let i = 0; i < rowsToCreate; i++) {
                    const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
                    stakeholder.create();
                    stakeholdersList.push(stakeholder);
                }
            }
        });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholders created before the tests
        if (stakeholdersList.length > 0) {
            stakeholdersList.forEach(function (stakeholder) {
                stakeholder.delete();
            });
        }
    });

    it("Navigation button validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.wait("@getStakeholders");

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
        cy.wait("@getStakeholders");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to second page
        cy.get(firstPageButton).should("not.be.disabled");
    });
});
