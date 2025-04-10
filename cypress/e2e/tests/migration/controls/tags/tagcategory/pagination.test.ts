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
    createMultipleTags,
    deleteAllTagsAndTagCategories,
    itemsPerPageValidation,
    login,
    selectItemsPerPage,
    validatePagination,
} from "../../../../../../utils/utils";
import { SEC } from "../../../../../types/constants";

import { TagCategory } from "../../../../../models/migration/controls/tagcategory";
import { appTable } from "../../../../../views/common.view";
import { tagCategory } from "../../../../../views/tags.view";

describe(["@tier3"], "Tag category pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        TagCategory.openList();
        let rowsToCreate = 0;

        // Get the current table row count for tag category and create appropriate test data rows
        cy.get(appTable, { timeout: 2 * SEC })
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get(tagCategory).then(($rows) => {
                        let rowCount = $rows.length;
                        if (rowCount <= 10) {
                            rowsToCreate = 11 - rowCount;
                        }
                        if (rowsToCreate > 0) {
                            // Create multiple tag categories
                            createMultipleTags(rowsToCreate);
                        }
                    });
                } else {
                    rowsToCreate = 11;
                    // Create multiple tag categories
                    createMultipleTags(rowsToCreate);
                }
            });
    });

    it("Navigation button validations", function () {
        TagCategory.openList();
        selectItemsPerPage(10);
        validatePagination();
    });

    it("Items per page validations", function () {
        TagCategory.openList();
        selectItemsPerPage(10);
        itemsPerPageValidation(appTable, "Tag category");
    });

    after("Perform test data clean up", function () {
        deleteAllTagsAndTagCategories();
    });
});
