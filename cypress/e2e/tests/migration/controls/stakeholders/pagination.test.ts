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
    selectItemsPerPage,
    deleteTableRows,
    createMultipleStakeholders,
    deleteByList,
} from "../../../../../utils/utils";
import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    pageNumInput,
    prevPageButton,
} from "../../../../views/common.view";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

describe(["@tier3"], "Stakeholder pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        createMultipleStakeholders(11);
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    it("Navigation button validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.get("@getStakeholders");

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
        cy.get("@getStakeholders");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get("td[data-label=Email]").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPage(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label=Email]").then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Page number validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Go to page number 2
        cy.get(pageNumInput).eq(0).clear().type("2").type("{enter}");

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Navigate to last page
        cy.get(lastPageButton).eq(0).click();
        cy.wait(2000);

        // Delete all items of last page
        deleteTableRows(stakeHoldersTable);

        // Verify that page is re-directed to previous page
        cy.get("td[data-label=Email]").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });
    });

    after("Perform test data clean up", function () {
        deleteTableRows(stakeHoldersTable);
    });
});
