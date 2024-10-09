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
    createMultipleBusinessServices,
    login,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    clickOnSortButton,
    deleteByList,
} from "../../../../../utils/utils";
import { name, tags, SortType, businessService, SEC, analysis } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Application } from "../../../../models/migration/applicationinventory/application";

var applicationsList: Array<Application> = [];
let businessServicesList: Array<BusinessServices> = [];

describe(["@tier3"], "Application inventory sort validations", function () {
    before("Login and Create Test Data", function () {
        login();

        var tagsList = ["C++", "COBOL", "Java"];
        businessServicesList = createMultipleBusinessServices(3);
        for (let i = 0; i < 3; i++) {
            let appdata = {
                name: data.getFullName(),
                tags: tagsList,
                business: businessServicesList[i].name,
            };
            const application = new Application(appdata);
            application.create();
            applicationsList.push(application);
            tagsList.pop();
        }
    });

    it("Name sort validations", function () {
        Application.open();

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the application inventory by name in ascending order
        clickOnSortButton(name, SortType.ascending);
        cy.wait(2 * SEC);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by name in descending order
        clickOnSortButton(name, SortType.descending);
        cy.wait(2 * SEC);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Analysis status sort validations", function () {
        Application.open();
        // get unsorted list when page loads
        const unsortedList = getTableColumnData(analysis);
        // Sort the application inventory by Tag count in ascending order
        clickOnSortButton(analysis, SortType.ascending);
        cy.wait(2 * SEC);
        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(analysis);
        verifySortAsc(afterAscSortList, unsortedList);
        // Sort the application inventory by analysis in descending order
        clickOnSortButton(analysis, SortType.descending);
        cy.wait(2000);
        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(analysis);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Business service sort validations", function () {
        Application.open();

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(businessService);

        // Sort the application inventory by Tag count in ascending order
        clickOnSortButton(businessService, SortType.ascending);
        cy.wait(2 * SEC);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(businessService);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by tags in descending order
        clickOnSortButton(businessService, SortType.descending);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(businessService);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Tag count sort validations", function () {
        Application.open();

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(tags);

        // Sort the application inventory by Tag count in ascending order
        clickOnSortButton(tags, SortType.ascending);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tags);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by tags in descending order
        clickOnSortButton(tags, SortType.descending);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tags);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationsList);
        deleteByList(businessServicesList);
    });
});
