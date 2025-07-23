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
    createMultipleJobFunctions,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteByList,
    getTableColumnData,
    login,
    verifySortAsc,
    verifySortDesc,
} from "../../../../../utils/utils";
import { displayName, email, jobFunction, SortType } from "../../../../types/constants";

import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

let stakeholdersList: Array<Stakeholders> = [];
let jobFunctionsList: Array<Jobfunctions> = [];
let stakeholderGroupList: Array<Stakeholdergroups> = [];

describe(["@tier3"], "Stakeholder sort validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        jobFunctionsList = createMultipleJobFunctions(2);
        stakeholderGroupList = createMultipleStakeholderGroups(2);
        stakeholdersList = createMultipleStakeholders(2, jobFunctionsList, stakeholderGroupList);
    });

    it("Email sort validations", function () {
        Stakeholders.openList();
        const unsortedList = getTableColumnData(email);

        // Sort the stakeholders by email in ascending order
        clickOnSortButton(email, SortType.ascending, stakeHoldersTable);
        const afterAscSortList = getTableColumnData(email);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by email in descending order
        clickOnSortButton(email, SortType.descending, stakeHoldersTable);
        const afterDescSortList = getTableColumnData(email);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Display name sort validations", function () {
        Stakeholders.openList();
        const unsortedList = getTableColumnData(displayName);

        // Sort the stakeholders by display name in ascending order
        clickOnSortButton(displayName, SortType.ascending, stakeHoldersTable);
        const afterAscSortList = getTableColumnData(displayName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by display name in descending order
        clickOnSortButton(displayName, SortType.descending, stakeHoldersTable);
        const afterDescSortList = getTableColumnData(displayName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Job function sort validations", function () {
        Stakeholders.openList();
        const unsortedList = getTableColumnData(jobFunction);

        // Sort the stakeholders by Job function in ascending order
        clickOnSortButton(jobFunction, SortType.ascending, stakeHoldersTable);
        const afterAscSortList = getTableColumnData(jobFunction);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by Job function in descending order
        clickOnSortButton(jobFunction, SortType.descending, stakeHoldersTable);
        const afterDescSortList = getTableColumnData(jobFunction);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(stakeholderGroupList);
        deleteByList(jobFunctionsList);
    });
});
