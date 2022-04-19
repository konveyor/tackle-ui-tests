/// <reference types="cypress" />

import {
    login,
    clickByText,
    exists,
    click,
    applySearchFilter,
    selectItemsPerPage,
    preservecookies,
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    stakeholderGroups,
    button,
    tdTag,
    trTag,
    description,
    member,
    clearAllFilters,
    name,
} from "../../../types/constants";

import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";

import * as commonView from "../../../../integration/views/common.view";
import * as data from "../../../../utils/data_utils";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var invalidSearchInput = data.getRandomNumber();

describe("Stakeholder groups filter validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Create multiple stakeholder groups and stakeholders
        stakeholdersList = createMultipleStakeholders(2);
        stakeholdergroupsList = createMultipleStakeholderGroups(2, stakeholdersList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    after("Perform test data clean up", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the stakeholder groups and stakeholders created before the tests
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
    });

    it("Name filter validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholderGroups);
        cy.wait("@getStakeholdergroups");

        // Enter an existing name substring and apply it as search filter
        var validSearchInput = stakeholdergroupsList[0].name.substring(0, 5);
        applySearchFilter(name, validSearchInput);

        // Assert that stakeholder groups row(s) containing the search text is/are displayed
        exists(stakeholdergroupsList[0].name);
        if (stakeholdergroupsList[1].name.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].name);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholdergroups");

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholdergroups");
    });

    it("Description filter validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholderGroups);
        cy.wait("@getStakeholdergroups");

        // Enter an existing description substring and apply it as search filter
        var validSearchInput = stakeholdergroupsList[0].description.substring(0, 3);
        applySearchFilter(description, validSearchInput);

        // Assert that stakeholder groups row(s) containing the search text is/are displayed
        exists(stakeholdergroupsList[0].description);
        if (stakeholdergroupsList[1].description.indexOf(validSearchInput) >= 0) {
            exists(stakeholdergroupsList[1].description);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholdergroups");

        // Enter a non-existing description substring and apply it as search filter
        applySearchFilter(description, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholdergroups");
    });

    it("Member filter validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholderGroups);
        cy.wait("@getStakeholdergroups");

        // Enter an existing member substring and apply it as search filter
        var validSearchInput = stakeholdergroupsList[0].members[0].substring(0, 3);
        applySearchFilter(member, validSearchInput);

        // Assert that stakeholder groups row(s) containing the search text is/are displayed
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(stakeholdergroupsList[0].name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(commonView.expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdergroupsList[0].members[0]);

        if (stakeholdergroupsList[1].members[0].indexOf(validSearchInput) >= 0) {
            exists(stakeholdergroupsList[1].members[0]);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholdergroups");

        // Enter a non-existing member substring and apply it as search filter
        applySearchFilter(member, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholdergroups");
    });
});
