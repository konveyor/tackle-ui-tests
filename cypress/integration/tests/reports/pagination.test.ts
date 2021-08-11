/// <reference types="cypress" />

import { login, clickByText, selectItemsPerPage } from "../../../utils/utils";
import { navMenu } from "../../views/menu.view";
import { reports, applicationinventory } from "../../types/constants";
import { ApplicationInventory } from "../../models/applicationinventory/applicationinventory";
import * as data from "../../../utils/data_utils";
import {
    selectItemsPerPageAdoptionCandidate,
    selectItemsPerPageIdentifiedRisks,
    expandArticle,
} from "../../models/reports/reports";
import { Stakeholders } from "../../models/stakeholders";
import * as commonView from "../../views/common.view";

var applicationsList: Array<ApplicationInventory> = [];
var stakeholdersList: Array<Stakeholders> = [];

describe("Reports pagination validations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        stakeholdersList.push(stakeholder);

        // Navigate to Application inventory tab
        clickByText(navMenu, applicationinventory);
        var rowsToCreate = 0;

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
                                rowsToCreate = 10 - rowCount;
                            }
                            if (rowsToCreate > 0) {
                                // Create multiple Applications
                                for (let i = 0; i < rowsToCreate; i++) {
                                    const application = new ApplicationInventory(
                                        data.getFullName()
                                    );
                                    application.create();
                                    applicationsList.push(application);
                                }
                            }
                        });
                } else {
                    rowsToCreate = 10;
                    // Create multiple Applications
                    for (let i = 0; i < rowsToCreate; i++) {
                        const application = new ApplicationInventory(data.getFullName());
                        application.create();
                        applicationsList.push(application);
                    }
                }
            });

        const newApplication = new ApplicationInventory(data.getFullName());
        newApplication.create();
        applicationsList.push(newApplication);

        // Perform assessment of application
        newApplication.perform_assessment("high", [stakeholder.name]);
        cy.wait(4000);
        newApplication.is_assessed();
        cy.wait(4000);
        // Perform application review
        newApplication.perform_review("high");
        cy.wait(4000);
        newApplication.is_reviewed();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder
        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });

        // Delete the Applications created before the tests
        clickByText(navMenu, applicationinventory);
        cy.wait(3000);
        applicationsList.forEach(function (application) {
            cy.get(".pf-c-table > tbody > tr")
                .not(".pf-c-table__expandable-row")
                .find("td[data-label=Name]")
                .each(($rows) => {
                    if ($rows.text() === application.name) application.delete();
                });
        });
    });

    it("Adoption candidate distribution - Navigation button validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // select 10 items per page
        selectItemsPerPageAdoptionCandidate(10);

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

        // Verify that previous buttons are enabled after moving to next page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(commonView.firstPageButton).should("not.be.disabled");
    });

    it("Adoption candidate distribution - Items per page validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // Select 10 items per page
        selectItemsPerPageAdoptionCandidate(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get("td[data-label='Application name']").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPageAdoptionCandidate(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label='Application name']").then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Adoption candidate distribution - Page number validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // Select 10 items per page
        selectItemsPerPageAdoptionCandidate(10);
        cy.wait(2000);

        // Go to page number 2
        cy.get(commonView.pageNumInput).clear().type("2").type("{enter}");

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });
    });

    it("Identified risks - Navigation button validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // Exapand identified risks card
        expandArticle("Identified risks");
        cy.wait(3000);

        // select 10 items per page
        selectItemsPerPageIdentifiedRisks(10);

        // Verify next buttons are enabled as there are more than 11 rows present
        cy.get(commonView.nextPageButton).eq(2).should("not.be.disabled");
        cy.get(commonView.nextPageButton).eq(3).should("not.be.disabled");

        // Verify that previous buttons are disabled being on the first page
        cy.get(commonView.prevPageButton).eq(2).should("be.disabled");
        cy.get(commonView.prevPageButton).eq(3).should("be.disabled");

        // Verify that navigation button to last page is enabled
        cy.get(commonView.lastPageButton).eq(1).should("not.be.disabled");

        // Verify that navigation button to first page is disabled being on the first page
        cy.get(commonView.firstPageButton).eq(1).should("be.disabled");

        // Navigate to next page
        cy.get(commonView.nextPageButton).eq(3).click();

        // Verify that previous buttons are enabled after moving to next page
        cy.get(commonView.prevPageButton).eq(2).should("not.be.disabled");
        cy.get(commonView.prevPageButton).eq(3).should("not.be.disabled");

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(commonView.firstPageButton).eq(1).should("not.be.disabled");
    });

    it("Identified risks - Items per page validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // Exapand identified risks card
        expandArticle("Identified risks");
        cy.wait(2000);

        // Select 10 items per page
        selectItemsPerPageIdentifiedRisks(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get("td[data-label='Category']").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPageIdentifiedRisks(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label='Category']").then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Identified risks - Page number validations", function () {
        // Navigate to reports page
        clickByText(navMenu, reports);
        cy.wait(3000);

        // Exapand identified risks card
        expandArticle("Identified risks");
        cy.wait(2000);

        // Select 10 items per page
        selectItemsPerPageIdentifiedRisks(10);
        cy.wait(2000);

        // Go to page number 2
        cy.get(commonView.pageNumInput).eq(1).clear().type("2").type("{enter}");

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton)
            .eq(1)
            .each(($previousBtn) => {
                cy.wrap($previousBtn).should("not.be.disabled");
            });
    });
});
