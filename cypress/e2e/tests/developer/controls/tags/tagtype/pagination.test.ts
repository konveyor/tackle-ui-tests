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
    deleteAllTagsAndTagTypes,
    selectUserPerspective,
    goToPage,
    validatePagination,
} from "../../../../../../utils/utils";
import { navMenu, navTab } from "../../../../../views/menu.view";
import { controls, SEC, tags } from "../../../../../types/constants";

import {
    firstPageButton,
    lastPageButton,
    nextPageButton,
    prevPageButton,
    appTable,
} from "../../../../../views/common.view";
import { TagType } from "../../../../../models/developer/controls/tagtypes";

describe(["@tier3"], "Tag type pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        TagType.openList();
        let rowsToCreate = 0;

        // Get the current table row count for tag types and create appropriate test data rows
        cy.get(appTable, { timeout: 2 * SEC })
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get("td[data-label='Tag type']").then(($rows) => {
                        let rowCount = $rows.length;
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
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Delete the tags created before the tests
        deleteAllTagsAndTagTypes();
    });

    it("Navigation button validations", function () {
        // Navigate to Tags tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);

        // select 10 items per page
        selectItemsPerPage(10);

        // Run validation
        validatePagination();
    });

    it("Items per page validations", function () {
        // Navigate to Tags tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);

        // Select 10 items per page
        selectItemsPerPage(10);

        // Verify that only 10 items are displayed
        cy.get("td[data-label='Tag type']", { timeout: 2 * SEC }).then(($rows) => {
            cy.wrap($rows.length).should("eq", 10);
        });

        // Select 20 items per page
        selectItemsPerPage(20);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get("td[data-label='Tag type']", { timeout: 2 * SEC }).then(($rows) => {
            cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
        });
    });

    it("Page number validations", function () {
        // Navigate to Tags tab
        TagType.openList();

        // Select 10 items per page
        selectItemsPerPage(10);

        // Go to page number 2
        goToPage(2);

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Go back to page number 1
        goToPage(1);
    });
});
