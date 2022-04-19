/// <reference types="cypress" />

import {
    login,
    clickByText,
    exists,
    applySearchFilter,
    hasToBeSkipped,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import { controls, button, clearAllFilters, tags, tagType } from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";

describe("Tag type filter validations", { tags: "@tier2" }, function () {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Interceptors
        cy.intercept("GET", "/api/controls/tag-type*").as("getTagtypes");
    });

    it("Tag type filter validations", function () {
        // Navigate to Tags tab
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

        // Enter an existing tag type name substring and apply it as search filter
        var validSearchInput = data.getExistingTagtype();
        applySearchFilter(tagType, validSearchInput);

        // Assert that tag type row(s) containing the search text is/are displayed
        exists(validSearchInput);

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getTagtypes");

        // Enter a non-existing tag type name substring and apply it as search filter
        var invalidSearchInput = String(data.getRandomNumber(111111, 222222));
        applySearchFilter(tagType, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);
    });
});
