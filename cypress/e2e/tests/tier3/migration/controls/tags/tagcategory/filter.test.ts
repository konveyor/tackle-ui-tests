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

import { applySearchFilter, clickByText, exists } from "../../../../../../utils/utils";
import { button, clearAllFilters, color } from "../../../../../types/constants";

import * as data from "../../../../../../utils/data_utils";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";

describe(["@tier3"], "Tag tagCategory filter validations", function () {
    beforeEach("Login", function () {
        cy.intercept("GET", "/hub/tag-category*").as("getTagCategories");
    });

    it("Tag category color filter validations", function () {
        TagCategory.openList();

        // Enter an existing tag category color substring and apply it as search filter
        var validSearchInput = data.getColor();
        applySearchFilter(color, validSearchInput);
        exists(validSearchInput);

        clickByText(button, clearAllFilters);
        cy.get("@getTagCategories");

        // Enter a non-existing tag type color substring and apply it as search filter
        var invalidSearchInput = String(data.getRandomWord(3));
        applySearchFilter(color, invalidSearchInput);
        cy.get("h2").contains("No tags available");
        clickByText(button, clearAllFilters);
    });
});
