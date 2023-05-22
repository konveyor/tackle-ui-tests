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
    deleteApplicationTableRows,
} from "../../../../../utils/utils";
import { navMenu } from "../../../../views/menu.view";
import { applicationInventory, name, tagCount, review } from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";
import { Assessment } from "../../../../models/developer/applicationinventory/assessment";

var applicationsList: Array<Assessment> = [];

describe("Application inventory sort validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Delete the existing applications
        deleteApplicationTableRows();

        var tagsList = ["C++", "COBOL", "Java"];
        // Create multiple applications with tags
        for (let i = 0; i < 3; i++) {
            let appdata = {
                name: data.getFullName(),
                tags: tagsList,
            };
            // Create new application
            const application = new Assessment(appdata);
            application.create();
            applicationsList.push(application);
            tagsList.pop();
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the applications created before the tests
        deleteApplicationTableRows();
    });

    it("Name sort validations", function () {
        // Navigate to application inventory page
        Assessment.open();
        cy.wait("@getApplications");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the application inventory by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Review sort validations", function () {
        // Navigate to application inventory page
        Assessment.open();
        cy.wait("@getApplications");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(review);

        // Sort the application inventory by review in ascending order
        sortAsc(review);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(review);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by name in descending order
        sortDesc(review);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(review);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Tag count sort validations", function () {
        // Navigate to application inventory page
        Assessment.open();
        cy.wait("@getApplications");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(tagCount);

        // Sort the application inventory by Tag count in ascending order
        sortAsc(tagCount);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tagCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by tags in descending order
        sortDesc(tagCount);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tagCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
