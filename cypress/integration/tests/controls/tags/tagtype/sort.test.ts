/// <reference types="cypress" />

import {
    login,
    clickByText,
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    preservecookies,
    hasToBeSkipped,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import { controls, tags, tagtype, rank, tagCount } from "../../../../types/constants";

describe("Tag type sort validations", { tags: "@tier2" }, function () {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/controls/tag-type*").as("getTagtypes");
    });

    it("Tag type name sort validations", function () {
        // Navigate to Tags tab
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(tagtype);

        // Sort the tag type by name in ascending order
        sortAsc(tagtype);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tagtype);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag type by name in descending order
        sortDesc(tagtype);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tagtype);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Rank sort validations", function () {
        // Navigate to Tags tab
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(rank);

        // Sort the tag type by rank in ascending order
        sortAsc(rank);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(rank);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag type by rank in descending order
        sortDesc(rank);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in descending order
        const afterDescSortList = getTableColumnData(rank);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Tag count sort validations", function () {
        // Navigate to Tags tab
        clickByText(navMenu, controls);
        clickByText(navTab, tags);
        cy.wait("@getTagtypes");

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(tagCount);

        // Sort the tag type by tag count in ascending order
        sortAsc(tagCount);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tagCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the tag type by tag count in descending order
        sortDesc(tagCount);
        cy.wait(2000);

        // Verify that the tag type rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tagCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
