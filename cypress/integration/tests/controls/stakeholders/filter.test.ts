/// <reference types="cypress" />

import {
    login,
    clickByText,
    exists,
    notExists,
    click,
    applySearchFilter,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    stakeholders,
    button,
    tdTag,
    trTag,
    emailFilter,
    displayNameFilter,
    jobfunctionFilter,
    groupFilter,
    clearAllFilters,
} from "../../../types/constants";

import { Stakeholders } from "../../../models/stakeholders";
import { Jobfunctions } from "../../../models/jobfunctions";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";

import * as commonView from "../../../../integration/views/commoncontrols.view";
import * as data from "../../../../utils/data_utils";

var stakeholdersList: Array<Stakeholders> = [];
var jobfunctionsList: Array<Jobfunctions> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var invalidSearchInput = "qqqqq";

describe("Stakeholder filter validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple job functions, stakeholder groups and stakeholders
        for (let i = 0; i < 2; i++) {
            // Create new job function
            const jobfunction = new Jobfunctions(data.getJobTitle());
            jobfunction.create();
            jobfunctionsList.push(jobfunction);

            // Create new stakeholder group
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription()
            );
            stakeholdergroup.create();
            stakeholdergroupsList.push(stakeholdergroup);

            // Create new stakeholder
            const stakeholder = new Stakeholders(
                data.getEmail(),
                data.getFullName(),
                jobfunction.name,
                [stakeholdergroup.name]
            );
            stakeholder.create();
            stakeholdersList.push(stakeholder);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    after("Perform test data clean up", function () {
        // Delete the job functions, stakeholder groups and stakeholders created before the tests
        jobfunctionsList.forEach(function (jobfunction) {
            jobfunction.delete();
        });

        stakeholdergroupsList.forEach(function (stakeholdergroup) {
            stakeholdergroup.delete();
        });

        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });
    });

    it("Email filter validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing email substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].email.substring(0, 5);
        applySearchFilter(emailFilter, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        exists(stakeholdersList[0].email);
        if (stakeholdersList[1].email.substring(0, 5) == validSearchInput) {
            exists(stakeholdersList[1].email);
        } else {
            notExists(stakeholdersList[1].email);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing email substring and apply it as search filter
        applySearchFilter(emailFilter, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });

    it("Display name filter validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing display name substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].name.substring(0, 3);
        applySearchFilter(displayNameFilter, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        exists(stakeholdersList[0].name);
        if (stakeholdersList[1].name.substring(0, 3) == validSearchInput) {
            exists(stakeholdersList[1].name);
        } else {
            notExists(stakeholdersList[1].name);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing display name substring and apply it as search filter
        applySearchFilter(displayNameFilter, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });

    it("Job function filter validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing job function substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].jobfunction.substring(0, 3);
        applySearchFilter(jobfunctionFilter, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        cy.get(tdTag)
            .contains(stakeholdersList[0].email)
            .siblings()
            .get("td[data-label='Job function']")
            .should("contain", stakeholdersList[0].jobfunction);

        if (stakeholdersList[1].jobfunction.substring(0, 3) == validSearchInput) {
            exists(stakeholdersList[1].email);
        } else {
            notExists(stakeholdersList[1].email);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing job function substring and apply it as search filter
        applySearchFilter(jobfunctionFilter, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });

    it("Group filter validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing group substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].groups[0].substring(0, 3);
        applySearchFilter(groupFilter, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        cy.get(tdTag)
            .contains(stakeholdersList[0].email)
            .parent(trTag)
            .within(() => {
                click(commonView.expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdersList[0].groups[0]);

        if (stakeholdersList[1].groups[0].substring(0, 3) == validSearchInput) {
            exists(stakeholdersList[1].email);
        } else {
            notExists(stakeholdersList[1].email);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing group substring and apply it as search filter
        applySearchFilter(groupFilter, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });
});
