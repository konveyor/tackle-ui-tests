/// <reference types="cypress" />

import { login, clickByText, selectItemsPerPage, click } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, businessservices, tdTag, trTag } from "../../../types/constants";

import { BusinessServices } from "../../../models/businessservices";

import * as data from "../../../../utils/data_utils";
import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    pageNumInput,
    prevPageButton,
    appTable,
    deleteButton,
    confirmButton,
} from "../../../views/common.view";

var businessservicesList: Array<BusinessServices> = [];

describe("Business services pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
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
                            // Create multiple business services
                            for (let i = 0; i < rowsToCreate; i++) {
                                const businessservice = new BusinessServices(data.getFullName());
                                businessservice.create();
                                businessservicesList.push(businessservice);
                            }
                        }
                    });
                } else {
                    rowsToCreate = 11;
                    // Create multiple business services
                    for (let i = 0; i < rowsToCreate; i++) {
                        const businessservice = new BusinessServices(data.getFullName());
                        businessservice.create();
                        businessservicesList.push(businessservice);
                    }
                }
            });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors for business services
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");
    });

    after("Perform test data clean up", function () {
        // Delete the business services created before the tests
        if (businessservicesList.length > 0) {
            // Navigate to business services tab
            clickByText(navMenu, controls);
            clickByText(navTab, businessservices);
            cy.wait("@getBusinessService");
            selectItemsPerPage(100);
            cy.wait(2000);

            businessservicesList.forEach(function (businessservice) {
                cy.get("td[data-label=Name]").each(($rows) => {
                    if ($rows.text() === businessservice.name) businessservice.delete();
                });
            });
        }
    });

    it("Navigation button validations", function () {
        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
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
});
