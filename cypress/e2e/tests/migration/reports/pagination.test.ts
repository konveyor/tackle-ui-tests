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
    createMultipleStakeholders,
    createMultipleApplications,
    selectUserPerspective,
    goToPage,
    deleteByList,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { migration, reports, SEC } from "../../../types/constants";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import {
    expandArticle,
    selectItemsPerPageinReports,
} from "../../../models/migration/reports/reports";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import * as commonView from "../../../views/common.view";
import {
    adoptionCandidateDistributionTitle,
    identiFiedRisksTitle,
} from "../../../views/reports.view";

let applicationsList: Array<Assessment> = [];
let stakeholdersList: Array<Stakeholders> = [];

describe(["@tier3"], "Reports pagination validations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();
        stakeholdersList = createMultipleStakeholders(1);
        let rowsToCreate = 11;

        // Create 11 applications
        applicationsList = createMultipleApplications(rowsToCreate);

        // Get the last extra application created
        let newApplication = applicationsList[applicationsList.length - 1];
        // Perform assessment of application
        newApplication.perform_assessment("high", [stakeholdersList[0].name]);
        newApplication.verifyStatus("assessment", "Completed");
        cy.wait(4 * SEC);
        // Perform application review
        newApplication.perform_review("high");
        newApplication.verifyStatus("review", "Completed");
    });

    it("Adoption candidate distribution - Navigation button validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // select 10 items per page
        selectItemsPerPageinReports(10, adoptionCandidateDistributionTitle);

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
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // Select 10 items per page
        selectItemsPerPageinReports(10, adoptionCandidateDistributionTitle);
        cy.wait(2 * SEC);

        // Verify that only 10 items are displayed
        cy.get("td[data-label='Application name']").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPageinReports(20, adoptionCandidateDistributionTitle);
        cy.wait(2 * SEC);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label='Application name']").then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Adoption candidate distribution - Page number validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // Select 10 items per page
        selectItemsPerPageinReports(10, adoptionCandidateDistributionTitle);
        cy.wait(2 * SEC);

        // Go to page number 2
        goToPage(2);

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });
    });

    it("Identified risks - Navigation button validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // Expand identified risks card
        expandArticle("Identified risks");
        cy.wait(3 * SEC);

        // select 10 items per page
        selectItemsPerPageinReports(10, identiFiedRisksTitle);

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
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // Expand identified risks card
        expandArticle("Identified risks");
        cy.wait(2 * SEC);

        // Select 10 items per page
        selectItemsPerPageinReports(10, identiFiedRisksTitle);
        cy.wait(2 * SEC);

        // Verify that only 10 items are displayed
        cy.get("td[data-label='Category']").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPageinReports(20, identiFiedRisksTitle);
        cy.wait(2 * SEC);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label='Category']").then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Identified risks - Page number validations", function () {
        // Navigate to reports page
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(3 * SEC);

        // Expand identified risks card
        expandArticle("Identified risks");
        cy.wait(2 * SEC);

        // Select 10 items per page
        selectItemsPerPageinReports(10, identiFiedRisksTitle);
        cy.wait(2 * SEC);

        // Go to page number 2
        cy.get(commonView.pageNumInput).eq(1).clear().type("2").type("{enter}");

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton)
            .eq(1)
            .each(($previousBtn) => {
                cy.wrap($previousBtn).should("not.be.disabled");
            });
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholders and applications created before the tests
        deleteByList(stakeholdersList);
        deleteByList(applicationsList);
    });
});
