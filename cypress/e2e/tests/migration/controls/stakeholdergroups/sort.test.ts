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
    clickOnSortButton,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteByList,
    getTableColumnData,
    login,
    verifySortAsc,
    verifySortDesc,
} from "../../../../../utils/utils";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { memberCount, name, SortType } from "../../../../types/constants";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholdersList: Array<Stakeholders> = [];

describe(["@tier3"], "Stakeholder groups sort validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        stakeholdersList = createMultipleStakeholders(3);
        stakeholdergroupsList = createMultipleStakeholderGroups(3, stakeholdersList);
    });

    beforeEach("Interceptors", function () {
        cy.intercept("GET", "/hub/stakeholder-group*").as("getStakeholdergroups");
    });

    it("Name sort validations", function () {
        Stakeholdergroups.openList();
        cy.get("@getStakeholdergroups");
        const unsortedList = getTableColumnData(name);

        // Sort the stakeholder groups by name in ascending order
        clickOnSortButton(name, SortType.ascending);
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholder groups by name in descending order
        clickOnSortButton(name, SortType.descending);
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Member(s) sort validations", function () {
        Stakeholdergroups.openList();
        cy.get("@getStakeholdergroups");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(memberCount);

        // Sort the stakeholder groups by members in ascending order
        clickOnSortButton(memberCount, SortType.ascending);
        const afterAscSortList = getTableColumnData(memberCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholder groups by members in descending order
        clickOnSortButton(memberCount, SortType.descending);
        const afterDescSortList = getTableColumnData(memberCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdergroupsList);
        deleteByList(stakeholdersList);
    });
});
