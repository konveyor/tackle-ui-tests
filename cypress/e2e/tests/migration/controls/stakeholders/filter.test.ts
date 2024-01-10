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
    createMultipleJobFunctions,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteByList,
    selectFilter,
    filterInputText,
} from "../../../../../utils/utils";
import {
    button,
    tdTag,
    trTag,
    email,
    name,
    jobFunction,
    group,
    clearAllFilters,
} from "../../../../types/constants";

import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";

import * as commonView from "../../../../views/common.view";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

let stakeholdersList: Array<Stakeholders> = [];
let jobFunctionsList: Array<Jobfunctions> = [];
let stakeholderGroupsList: Array<Stakeholdergroups> = [];
let invalidSearchInput = "SomeInvalidInput";

describe(["@tier2"], "Stakeholder filter validations", function () {
    before("Login and Create Test Data", function () {
        login();

        // Create multiple job functions, stakeholder groups and stakeholders
        jobFunctionsList = createMultipleJobFunctions(2);
        stakeholderGroupsList = createMultipleStakeholderGroups(2);
        stakeholdersList = createMultipleStakeholders(2, jobFunctionsList, stakeholderGroupsList);
    });

    it("Email filter validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();

        // Enter an existing email substring and apply it as search filter
        let validSearchInput = stakeholdersList[0].email.substring(0, 5);
        applySearchFilter(email, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        exists(stakeholdersList[0].email, stakeHoldersTable);
        if (stakeholdersList[1].email.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].email, stakeHoldersTable);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a non-existing email substring and apply it as search filter
        applySearchFilter(email, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No stakeholder available");

        clickByText(button, clearAllFilters);
    });

    it("Display name filter validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();

        // Enter an existing display name substring and apply it as search filter
        let validSearchInput = stakeholdersList[0].name.substring(0, 3);
        selectFilter(name);
        filterInputText(validSearchInput, 0);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        exists(stakeholdersList[0].name, stakeHoldersTable);
        if (stakeholdersList[1].name.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].name, stakeHoldersTable);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a non-existing display name substring and apply it as search filter
        selectFilter(name);
        filterInputText(invalidSearchInput, 0);

        // Assert that no search results are found
        cy.get("h2").contains("No stakeholder available");

        clickByText(button, clearAllFilters);
    });

    it("Job function filter validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();

        // Enter an existing job function substring and apply it as search filter
        let validSearchInput = stakeholdersList[0].jobfunction.substring(0, 3);
        applySearchFilter(jobFunction, validSearchInput);

        // Assert that stakeholder row(s) containing the search text is/are displayed
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(stakeholdersList[0].email)
            .siblings()
            .get("td[data-label='Job function']")
            .should("contain", stakeholdersList[0].jobfunction);

        if (stakeholdersList[1].jobfunction.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].email, stakeHoldersTable);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a non-existing job function substring and apply it as search filter
        applySearchFilter(jobFunction, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No stakeholder available");

        clickByText(button, clearAllFilters);
    });

    it("Group filter validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();

        // Enter an existing group substring and apply it as search filter
        let validSearchInput = stakeholdersList[0].groups[0].substring(0, 3);
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
            exists(stakeholdersList[1].email, stakeHoldersTable);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a non-existing group substring and apply it as search filter
        applySearchFilter(group, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No stakeholder available");

        clickByText(button, clearAllFilters);
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(stakeholderGroupsList);
        deleteByList(jobFunctionsList);
    });
});
