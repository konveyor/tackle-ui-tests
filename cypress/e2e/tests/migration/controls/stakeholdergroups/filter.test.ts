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
    click,
    applySearchFilter,
    selectItemsPerPage,
    preservecookies,
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
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
    stakeholders,
} from "../../../../types/constants";

import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";

import * as commonView from "../../../../../integration/views/common.view";
import * as data from "../../../../../utils/data_utils";

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
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholdergroups");
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
        Stakeholdergroups.openList();
        cy.get("@getStakeholdergroups");

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
        cy.get("@getStakeholdergroups");

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No stakeholder groups available");

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.get("@getStakeholdergroups");
    });

    it("Description filter validations", function () {
        // Navigate to stakeholder groups tab
        Stakeholdergroups.openList();
        cy.get("@getStakeholdergroups");

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
        cy.get("@getStakeholdergroups");

        // Enter a non-existing description substring and apply it as search filter
        applySearchFilter(description, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No stakeholder groups available");

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.get("@getStakeholdergroups");
    });

    it("Member filter validations", function () {
        // Navigate to stakeholder groups tab
        Stakeholdergroups.openList();
        cy.get("@getStakeholdergroups");

        // Enter an existing member substring and apply it as search filter
        var validSearchInput = stakeholdergroupsList[0].members[0].substring(0, 3);
        applySearchFilter(stakeholders, validSearchInput);

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
        cy.get("@getStakeholdergroups");

        // Enter a non-existing member substring and apply it as search filter
        applySearchFilter(stakeholders, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No stakeholder groups available");

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.get("@getStakeholdergroups");
    });
});
