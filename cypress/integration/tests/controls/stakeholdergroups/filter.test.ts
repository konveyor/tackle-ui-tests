/// <reference types="cypress" />

import {
    login,
    clickByText,
    exists,
    notExists,
    click,
    applySearchFilter,
    selectItemsPerPage,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    stakeholdergroups,
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

describe("Stakeholder groups filter validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple stakeholder groups and stakeholders
        for (let i = 0; i < 2; i++) {
            // Create new stakeholder
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();
            stakeholdersList.push(stakeholder);

            // Create new stakeholder group
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription(),
                [stakeholder.name]
            );
            stakeholdergroup.create();
            stakeholdergroupsList.push(stakeholdergroup);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder groups and stakeholders created before the tests
        stakeholdergroupsList.forEach(function (stakeholdergroup) {
            stakeholdergroup.delete();
        });

        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });
    });

    it("Name filter validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Enter an existing name substring and apply it as search filter
        var validSearchInput = stakeholdergroupsList[0].name.substring(0, 5);
        applySearchFilter(name, validSearchInput);

        // Assert that stakeholder groups row(s) containing the search text is/are displayed
        exists(stakeholdergroupsList[0].name);
        if (stakeholdergroupsList[1].name.substring(0, 5) == validSearchInput) {
            exists(stakeholdersList[1].name);
        } else {
            notExists(stakeholdersList[1].name);
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
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Enter an existing description substring and apply it as search filter
        var validSearchInput = stakeholdergroupsList[0].description.substring(0, 3);
        applySearchFilter(description, validSearchInput);

        // Assert that stakeholder groups row(s) containing the search text is/are displayed
        exists(stakeholdergroupsList[0].description);
        if (stakeholdergroupsList[1].description.substring(0, 3) == validSearchInput) {
            exists(stakeholdergroupsList[1].description);
        } else {
            notExists(stakeholdergroupsList[1].description);
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
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Enter an existing member substring and apply it as search filter
        var validSearchInput = stakeholdergroupsList[0].members[0].substring(0, 3);
        applySearchFilter(member, validSearchInput);

        // Assert that stakeholder groups row(s) containing the search text is/are displayed
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(stakeholdergroupsList[0].name)
            .parent(trTag)
            .within(() => {
                click(commonView.expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdergroupsList[0].members[0]);

        if (stakeholdergroupsList[1].members[0].substring(0, 3) == validSearchInput) {
            exists(stakeholdergroupsList[1].members[0]);
        } else {
            notExists(stakeholdergroupsList[1].members[0]);
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
