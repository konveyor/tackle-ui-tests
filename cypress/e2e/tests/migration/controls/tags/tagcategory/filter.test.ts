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

import { applySearchFilter, clickByText, exists, login } from "../../../../../../utils/utils";
import { button, clearAllFilters, color, rank } from "../../../../../types/constants";

import * as data from "../../../../../../utils/data_utils";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";

describe(["@tier3"], "Tag tagCategory filter validations", function () {
    beforeEach("Login", function () {
        login();

        // Interceptors
        cy.intercept("GET", "/hub/tag-category*").as("getTagCategories");
    });

    it("Tag category color filter validations", function () {
        // Navigate to Tags tab
        TagCategory.openList();

        // Enter an existing tag category color substring and apply it as search filter
        var validSearchInput = data.getColor();
        applySearchFilter(color, validSearchInput);

        // Assert that tag category row(s) containing the search text is/are displayed
        exists(validSearchInput);

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.get("@getTagCategories");

        // Enter a non-existing tag type color substring and apply it as search filter
        var invalidSearchInput = String(data.getRandomWord(3));
        applySearchFilter(color, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No tags available");

        clickByText(button, clearAllFilters);
    });

    it("Tag category rank filter validations", function () {
        // Navigate to Tags tab
        TagCategory.openList();

        // Enter an existing tag category rank number and apply it as search filter
        var validSearchInput = String(data.getRandomNumber(1, 6));
        applySearchFilter(rank, validSearchInput);

        // Assert that tag category row(s) containing the search text is/are displayed
        exists(validSearchInput);

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.get("@getTagCategories");

        // Enter a non-existing tag category rank number and apply it as search filter
        var invalidSearchInput = String(data.getRandomNumber(1111, 2222));
        applySearchFilter(rank, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No tags available");

        clickByText(button, clearAllFilters);
    });
});
