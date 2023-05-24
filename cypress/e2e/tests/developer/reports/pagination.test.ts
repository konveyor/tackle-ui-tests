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
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleApplications,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    selectUserPerspective,
    createMultipleBusinessServices,
    goToPage,
    deleteAllBusinessServices,
    deleteAllTagsAndTagTypes,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationInventory, reports } from "../../../types/constants";
import { Assessment } from "../../../models/developer/applicationinventory/assessment";
import {
    selectItemsPerPageAdoptionCandidate,
    selectItemsPerPageIdentifiedRisks,
    expandArticle,
} from "../../../models/developer/reports/reports";
import { Stakeholders } from "../../../models/developer/controls/stakeholders";
import * as commonView from "../../../views/common.view";
import { BusinessServices } from "../../../models/developer/controls/businessservices";

var applicationsList: Array<Assessment> = [];
var stakeholdersList: Array<Stakeholders> = [];
var businessservicelist: Array<BusinessServices> = [];

describe(["@tier3"], "Reports pagination validations", () => {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        stakeholdersList = createMultipleStakeholders(1);
        var rowsToCreate = 11;

        // Create 11 applications
        applicationsList = createMultipleApplications(rowsToCreate);

        // Get the last extra application created
        var newApplication = applicationsList[applicationsList.length - 1];
        // Perform assessment of application
        newApplication.perform_assessment("high", [stakeholdersList[0].name]);
        newApplication.verifyStatus("assessment", "Completed");
        cy.wait(4000);
        // Perform application review
        newApplication.perform_review("high");
        newApplication.verifyStatus("review", "Completed");
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete All
        clickByText(navMenu, applicationInventory);
        deleteApplicationTableRows();
        deleteAllStakeholders();
    });

    it("Adoption candidate distribution - Navigation button validations", function () {
        // Navigate to reports page
        selectUserPerspective("Developer");
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
        selectUserPerspective("Developer");
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
        selectUserPerspective("Developer");
        clickByText(navMenu, reports);
        cy.wait(3000);

        // Select 10 items per page
        selectItemsPerPageAdoptionCandidate(10);
        cy.wait(2000);

        // Go to page number 2
        goToPage(2);

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });
    });

    it("Identified risks - Navigation button validations", function () {
        // Navigate to reports page
        selectUserPerspective("Developer");
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
        cy.get(commonView.firstPageButton).eq(2).should("not.be.disabled");
    });

    it("Identified risks - Items per page validations", function () {
        // Navigate to reports page
        selectUserPerspective("Developer");
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
        selectUserPerspective("Developer");
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
