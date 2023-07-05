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
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
    clickOnSortButton,
} from "../../../../../utils/utils";
import { name, memberCount, SortType } from "../../../../types/constants";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholdersList: Array<Stakeholders> = [];

describe(["@tier2"], "Stakeholder groups sort validations", function () {
    before("Login and Create Test Data", function () {
        login();

        // Create multiple stakeholder groups and stakeholders
        stakeholdersList = createMultipleStakeholders(3);
        stakeholdergroupsList = createMultipleStakeholderGroups(3, stakeholdersList);
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/stakeholder-group*").as("getStakeholdergroups");
    });

    it("Name sort validations", function () {
        // Navigate to stakeholder groups tab
        Stakeholdergroups.openList();
        cy.get("@getStakeholdergroups");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the stakeholder groups by name in ascending order
        clickOnSortButton(name, SortType.ascending);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholder groups by name in descending order
        clickOnSortButton(name, SortType.descending);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Member(s) sort validations", function () {
        // Navigate to stakeholder groups tab
        Stakeholdergroups.openList();
        cy.get("@getStakeholdergroups");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(memberCount);

        // Sort the stakeholder groups by members in ascending order
        clickOnSortButton(memberCount, SortType.ascending);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(memberCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholder groups by members in descending order
        clickOnSortButton(memberCount, SortType.descending);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(memberCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder groups and stakeholders created before the tests
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
    });
});
