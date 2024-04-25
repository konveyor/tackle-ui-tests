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
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    clickOnSortButton,
} from "../../../../../../utils/utils";
import { rank, tagCount, SortType, tagCategory } from "../../../../../types/constants";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";

describe(["@tier2"], "Bug MTA-2681: Tag category sort validations", function () {
    before("Login", function () {
        login();
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/tag-category*").as("getTagCategories");
    });

    it("Bug MTA-2681: Tag category name sort validations", function () {
        // Navigate to Tags tab
        TagCategory.openList();
        cy.get("@getTagCategories");

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(tagCategory);

        // Sort the tag type by name in ascending order
        clickOnSortButton(tagCategory, SortType.ascending);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tagCategory);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag type by name in descending order
        clickOnSortButton(tagCategory, SortType.descending);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tagCategory);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Rank sort validations", function () {
        TagCategory.openList();
        cy.get("@getTagCategories");

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(rank);

        // Sort the tag category by rank in ascending order
        clickOnSortButton(rank, SortType.ascending);
        cy.wait(2000);

        // Verify that the tag category rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(rank);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag category by rank in descending order
        clickOnSortButton(rank, SortType.descending);
        cy.wait(2000);

        // Verify that the tag category rows are displayed in descending order
        const afterDescSortList = getTableColumnData(rank);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Tag count sort validations", function () {
        // Navigate to Tags tab
        TagCategory.openList();
        cy.get("@getTagCategories");

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(tagCount);

        // Sort the tag category by tag count in ascending order
        clickOnSortButton(tagCount, SortType.ascending);
        cy.wait(2000);

        // Verify that the tag category rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tagCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag category by tag count in descending order
        clickOnSortButton(tagCount, SortType.descending);
        cy.wait(2000);

        // Verify that the tag category rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tagCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
