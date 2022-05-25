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
    createMultipleTags,
    deleteAllTagTypes,
    selectUserPerspective,
} from "../../../../../../utils/utils";
import { navMenu, navTab } from "../../../../../views/menu.view";
import { controls, tags } from "../../../../../types/constants";

import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    pageNumInput,
    prevPageButton,
    appTable,
} from "../../../../../views/common.view";


describe("Tag type pagination validations", { tags: "@tier3" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        var rowsToCreate = 0;

        // Get the current table row count for tag types and create appropriate test data rows
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(appTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get("td[data-label='Tag type']").then(($rows) => {
                        var rowCount = $rows.length;
                        if (rowCount <= 10) {
                            rowsToCreate = 11 - rowCount;
                        }
                        if (rowsToCreate > 0) {
                            // Create multiple tag types
                            createMultipleTags(rowsToCreate);
                        }
                    });
                } else {
                    rowsToCreate = 11;
                    // Create multiple tag types
                    createMultipleTags(rowsToCreate);
                }
            });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/tag-type*").as("getTagtypes");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete the tags created before the tests
        deleteAllTagTypes();
    });

    it("Navigation button validations", function () {
        // Navigate to Tags tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

        // select 10 items per page
        selectItemsPerPage(10);
        cy.wait("@getTagtypes");

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
        cy.wait("@getTagtypes");

        // Verify that previous buttons are enabled after moving to next page
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        // Navigate to Tags tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get("td[data-label='Tag type']").then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPage(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label='Tag type']").then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Page number validations", function () {
        // Navigate to Tags tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

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
});
