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
    exists,
    preservecookies,
    click,
    applySearchFilter,
    selectItemsPerPage,
    hasToBeSkipped,
    deleteAllStakeholders,
    deleteAllJobfunctions,
    deleteAllStakeholderGroups,
    createMultipleJobfunctions,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import {
    controls,
    stakeholders,
    button,
    tdTag,
    trTag,
    email,
    displayName,
    jobFunction,
    group,
    clearAllFilters,
} from "../../../../types/constants";

import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { Jobfunctions } from "../../../../models/developer/controls/jobfunctions";
import { Stakeholdergroups } from "../../../../models/developer/controls/stakeholdergroups";

import * as commonView from "../../../../views/common.view";
import * as data from "../../../../../utils/data_utils";

var stakeholdersList: Array<Stakeholders> = [];
var jobfunctionsList: Array<Jobfunctions> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var invalidSearchInput = "qqqqq";


describe("Stakeholder filter validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Create multiple job functions, stakeholder groups and stakeholders
        jobfunctionsList = createMultipleJobfunctions(2);
        stakeholdergroupsList = createMultipleStakeholderGroups(2);
        stakeholdersList = createMultipleStakeholders(2, jobfunctionsList, stakeholdergroupsList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    after("Perform test data clean up", function () {
        // Prevent before hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the job functions, stakeholder groups and stakeholders created before the tests
        deleteAllJobfunctions();
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
    });

    it("Email filter validations", function () {
        selectUserPerspective("Developer");
        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing email substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].email.substring(0, 5);
        applySearchFilter(email, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        exists(stakeholdersList[0].email);
        if (stakeholdersList[1].email.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].email);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing email substring and apply it as search filter
        applySearchFilter(email, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);
    });

    it("Display name filter validations", function () {
        selectUserPerspective("Developer");

        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing display name substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].name.substring(0, 3);
        applySearchFilter(displayName, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        exists(stakeholdersList[0].name);
        if (stakeholdersList[1].name.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].name);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing display name substring and apply it as search filter
        applySearchFilter(displayName, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);
    });

    it("Job function filter validations", function () {
        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing job function substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].jobfunction.substring(0, 3);
        applySearchFilter(jobFunction, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(stakeholdersList[0].email)
            .siblings()
            .get("td[data-label='Job function']")
            .should("contain", stakeholdersList[0].jobfunction);

        if (stakeholdersList[1].jobfunction.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].email);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing job function substring and apply it as search filter
        applySearchFilter(jobFunction, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);
    });

    it("Group filter validations", function () {
        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Enter an existing group substring and apply it as search filter
        var validSearchInput = stakeholdersList[0].groups[0].substring(0, 3);
        applySearchFilter(group, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(stakeholdersList[0].email)
            .parent(trTag)
            .within(() => {
                click(commonView.expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdersList[0].groups[0]);

        if (stakeholdersList[1].groups[0].indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].email);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait("@getStakeholders");

        // Enter a non-existing group substring and apply it as search filter
        applySearchFilter(group, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);
    });
});
