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
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    preservecookies,
    hasToBeSkipped,
    createMultipleJobfunctions,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteAllJobfunctions,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
    selectUserPerspective,
} from "../../../../utils/utils";
const { _ } = Cypress;
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    email,
    stakeholders,
    displayName,
    jobFunction,
    groupCount,
} from "../../../types/constants";

import { Stakeholders } from "../../../models/controls/stakeholders";
import { Jobfunctions } from "../../../models/controls/jobfunctions";
import { Stakeholdergroups } from "../../../models/controls/stakeholdergroups";

var stakeholdersList: Array<Stakeholders> = [];
var jobfunctionsList: Array<Jobfunctions> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];

describe("Stakeholder sort validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
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
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the job functions, stakeholder groups and stakeholders created before the tests
        deleteAllJobfunctions();
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
    });

    it("Email sort validations", function () {
        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(email);

        // Sort the stakeholders by email in ascending order
        sortAsc(email);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(email);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by email in descending order
        sortDesc(email);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(email);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Display name sort validations", function () {
        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(displayName);

        // Sort the stakeholders by display name in ascending order
        sortAsc(displayName);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(displayName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by display name in descending order
        sortDesc(displayName);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(displayName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Job function sort validations", function () {
        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(jobFunction);

        // Sort the stakeholders by Job function in ascending order
        sortAsc(jobFunction);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(jobFunction);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by Job function in descending order
        sortDesc(jobFunction);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(jobFunction);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Group sort validations", function () {
        // Navigate to stakeholder tab
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(groupCount);

        // Sort the stakeholders by group count in ascending order
        sortAsc(groupCount);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(groupCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by group count in descending order
        sortDesc(groupCount);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(groupCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
