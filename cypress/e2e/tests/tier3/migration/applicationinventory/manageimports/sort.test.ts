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
    clickByText,
    clickOnSortButton,
    deleteAllMigrationWaves,
    deleteAppImportsTableRows,
    deleteApplicationTableRows,
    getTableColumnData,
    importApplication,
    login,
    openManageImportsPage,
    verifySortAsc,
    verifySortDesc,
} from "../../../../../utils/utils";
import { applicationInventory, SEC, SortType } from "../../../../types/constants";
import { navMenu } from "../../../../views/menu.view";

import { Application } from "../../../../models/migration/applicationinventory/application";
import { csvFileName, date, importStatus, user } from "../../../../views/applicationinventory.view";

const filePath = "app_import/csv/";

describe(["@tier3"], "Manage applications import sort validations", function () {
    before("Login and create test data", function () {
        login();
        cy.visit("/");
        clickByText(navMenu, applicationInventory);

        // Import multiple csv files
        const filesToImport = [
            "valid_application_rows.csv",
            "mandatory_and_empty_rows.csv",
            "non_existing_tags_business_service_rows.csv",
        ];
        filesToImport.forEach(function (csvFile) {
            importApplication(filePath + csvFile);
            cy.wait(2 * SEC);
        });
    });

    it("Date sort validations", function () {
        Application.open();
        openManageImportsPage();

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(date);

        // Sort the manage imports by date in ascending order
        clickOnSortButton(date, SortType.ascending);

        // Verify that the imports are date sorted in ascending order
        const afterAscSortList = getTableColumnData(date);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by date in descending order
        clickOnSortButton(date, SortType.descending);

        // Verify that the imports are date sorted in descending order
        const afterDescSortList = getTableColumnData(date);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("User sort validations", function () {
        Application.open(true);
        openManageImportsPage();

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(user);

        // Sort the manage imports by user in ascending order
        clickOnSortButton(user, SortType.ascending);

        // Verify that the users are displayed in ascending order
        const afterAscSortList = getTableColumnData(user);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by user in descending order
        clickOnSortButton(user, SortType.descending);

        // Verify that the users are displayed in descending order
        const afterDescSortList = getTableColumnData(user);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("File name sort validations", function () {
        Application.open(true);
        openManageImportsPage();

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(csvFileName);

        // Sort the manage imports by file name in ascending order
        clickOnSortButton(csvFileName, SortType.ascending);

        // Verify that the file names are displayed in ascending order
        const afterAscSortList = getTableColumnData(csvFileName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by file name in descending order
        clickOnSortButton(csvFileName, SortType.descending);

        // Verify that the file names are displayed in descending order
        const afterDescSortList = getTableColumnData(csvFileName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Import status sort validations", function () {
        Application.open(true);
        openManageImportsPage();

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(importStatus);

        // Sort the manage imports by status in ascending order
        clickOnSortButton(importStatus, SortType.ascending);

        // Verify that the import status rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(importStatus);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by status in descending order
        clickOnSortButton(importStatus, SortType.descending);

        // Verify that the import status rows are displayed in descending order
        const afterDescSortList = getTableColumnData(importStatus);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Perform test data clean up", function () {
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
    });
});
