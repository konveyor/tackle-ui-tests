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
    clickOnSortButton,
    getTableColumnData,
    verifySortAsc,
    verifySortDesc,
} from "../../../../../../utils/utils";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";
import { SortType, tagCategory, tagCount } from "../../../../../types/constants";

describe(["@tier3"], "Tag category sort validations", function () {
    beforeEach("Interceptors", function () {
        cy.intercept("GET", "/hub/tagcategories*").as("getTagCategories");
    });

    it("Tag category name sort validations", function () {
        TagCategory.openList();
        cy.wait("@getTagCategories");
        const unsortedList = getTableColumnData(tagCategory);

        // Sort the tag type by name in ascending order
        clickOnSortButton(tagCategory, SortType.ascending);
        const afterAscSortList = getTableColumnData(tagCategory);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag type by name in descending order
        clickOnSortButton(tagCategory, SortType.descending);
        const afterDescSortList = getTableColumnData(tagCategory);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Tag count sort validations", function () {
        TagCategory.openList();
        cy.wait("@getTagCategories");

        const unsortedList = getTableColumnData(tagCount);

        // Sort the tag category by tag count in ascending order
        clickOnSortButton(tagCount, SortType.ascending);
        const afterAscSortList = getTableColumnData(tagCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag category by tag count in descending order
        clickOnSortButton(tagCount, SortType.descending);
        const afterDescSortList = getTableColumnData(tagCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
