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
    createMultipleJobFunctions,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    selectUserPerspective,
    deleteByList,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import {
    controls,
    email,
    stakeholders,
    displayName,
    jobFunction,
    groupCount,
} from "../../../../types/constants";

import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { fieldHeader, groupCountHeader } from "../../../../views/stakeholders.view";

let stakeholdersList: Array<Stakeholders> = [];
let jobFunctionsList: Array<Jobfunctions> = [];
let stakeholderGroupList: Array<Stakeholdergroups> = [];

describe(["@tier2"], "Stakeholder sort validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple job functions, stakeholder groups and stakeholders
        jobFunctionsList = createMultipleJobFunctions(2);
        stakeholderGroupList = createMultipleStakeholderGroups(2);
        stakeholdersList = createMultipleStakeholders(2, jobFunctionsList, stakeholderGroupList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    after("Perform test data clean up", function () {
        // Delete the job functions, stakeholder groups and stakeholders created before the tests
        deleteByList(stakeholdersList);
        deleteByList(stakeholderGroupList);
        deleteByList(jobFunctionsList);
    });

    it("Email sort validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(email);

        // Sort the stakeholders by email in ascending order
        sortAsc(email, fieldHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(email);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by email in descending order
        sortDesc(email, fieldHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(email);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Display name sort validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(displayName);

        // Sort the stakeholders by display name in ascending order
        sortAsc(displayName, fieldHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(displayName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by display name in descending order
        sortDesc(displayName, fieldHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(displayName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Job function sort validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(jobFunction);

        // Sort the stakeholders by Job function in ascending order
        sortAsc(jobFunction, fieldHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(jobFunction);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by Job function in descending order
        sortDesc(jobFunction, fieldHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(jobFunction);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Group sort validations", function () {
        // Navigate to stakeholder tab
        Stakeholders.openList();
        cy.get("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(groupCount);

        // Sort the stakeholders by group count in ascending order
        sortAsc(groupCount, groupCountHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(groupCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by group count in descending order
        sortDesc(groupCount, groupCountHeader);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(groupCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
