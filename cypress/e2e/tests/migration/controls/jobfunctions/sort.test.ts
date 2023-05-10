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
    hasToBeSkipped,
    createMultipleJobFunctions,
    selectUserPerspective,
    deleteAllJobfunctions,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import { controls, name, jobFunctions } from "../../../../types/constants";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";

let jobFunctionsList: Array<Jobfunctions> = [];

describe(["@tier2"], "Job function sorting", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple job functions
        jobFunctionsList = createMultipleJobFunctions(2);
    });

    beforeEach("Persist session", function () {
        login();

        // Interceptors
        cy.intercept("GET", "/hub/jobfunctions*").as("getJobfunctions");
    });

    after("Perform test data clean up", function () {
        // Delete the job functions after before the tests
        deleteAllJobfunctions();
    });

    it("Name sort validations", function () {
        // Navigate to job functions tab
        Jobfunctions.openList();
        cy.wait("@getJobfunctions");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the Job functions by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the job function rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the job function by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the job function rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
