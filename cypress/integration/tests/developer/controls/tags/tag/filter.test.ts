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
    applySearchFilter,
    expandRowDetails,
    existsWithinRow,
    closeRowDetails,
    hasToBeSkipped,
    selectUserPerspective,
} from "../../../../../../utils/utils";
import { navMenu, navTab } from "../../../../../views/menu.view";
import {
    controls,
    button,
    clearAllFilters,
    tags,
    tagName,
    tdTag,
} from "../../../../../types/constants";
import { Tag } from "../../../../../models/developer/controls/tags";

import * as data from "../../../../../../utils/data_utils";

describe("Tags filter validations", { tags: "@tier2" }, function () {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Interceptors
        cy.intercept("GET", "/hub/tag-type*").as("getTagtypes");
    });

    it("Tag name filter validations", function () {
        // Navigate to Tags tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.get("@getTagtypes");

        const tag = new Tag(data.getRandomWord(5), data.getExistingTagtype());
        tag.create();
        cy.wait(2000);

        // Enter an existing tag name substring and apply it as search filter
        var validSearchInput = tag.name.substring(0, 3);
        applySearchFilter(tagName, validSearchInput);

        // Assert that tag type row(s) containing the search tag text is/are displayed
        expandRowDetails(tag.tagtype);
        existsWithinRow(tag.tagtype, tdTag, tag.name);
        closeRowDetails(tag.tagtype);

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getTagtypes");

        // Enter a non-existing tag name substring and apply it as search filter
        var invalidSearchInput = String(data.getRandomNumber(111111, 222222));
        applySearchFilter(tagName, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);

        // Delete the tag
        tag.delete();
        cy.wait(2000);
    });
});
