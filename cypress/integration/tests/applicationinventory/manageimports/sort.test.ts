/// <reference types="cypress" />

import {
    login,
    clickByText,
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    importApplication,
    openManageImportsPage,
    deleteApplicationTableRows,
    preservecookies,
    hasToBeSkipped,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory } from "../../../types/constants";
import * as commonView from "../../../views/common.view";

import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { BusinessServices } from "../../../models/businessservices";
import { csvFileName, date, importStatus, user } from "../../../views/applicationinventory.view";

const businessService = new BusinessServices("Finance and HR");
const filePath = "app_import/";
var applicationsList: Array<ApplicationInventory> = [];

describe("Manage applications import sort validations", { tags: "@tier2" }, function () {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        // Delete all applications
        deleteApplicationTableRows();

        // Create business service
        businessService.create();
        // Open the application inventory page
        clickByText(navMenu, applicationinventory);
        cy.wait(2000);

        // Import multiple csv files
        const filesToImport = [
            "valid_application_rows.csv",
            "mandatory_and_empty_rows.csv",
            "non_existing_tags_business_service_rows.csv",
        ];
        filesToImport.forEach(function (csvFile) {
            importApplication(filePath + csvFile);
            cy.wait(2000);
        });

        // Create objects for imported apps
        const appsImported = ["Import-app-1", "Import-app-2", "Import-app-5", "Import-app-6"];
        appsImported.forEach(function (appName) {
            const importedApp = new ApplicationInventory(appName);
            applicationsList.push(importedApp);
        });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplications");
        cy.intercept("GET", "/api/application-inventory/import-summary*").as(
            "getImportApplications"
        );
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the business service
        businessService.delete();
        deleteApplicationTableRows();
    });

    it("Date sort validations", function () {
        // Navigate to application inventory page and open manage imports
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();
        cy.wait("@getImportApplications");

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(date);

        // Sort the manage imports by date in ascending order
        sortAsc(date);
        cy.wait(2000);

        // Verify that the imports are date sorted in ascending order
        const afterAscSortList = getTableColumnData(date);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by date in descending order
        sortDesc(date);
        cy.wait(2000);

        // Verify that the imports are date sorted in descending order
        const afterDescSortList = getTableColumnData(date);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("User sort validations", function () {
        // Navigate to application inventory page and open manage imports
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(user);

        // Sort the manage imports by user in ascending order
        sortAsc(user);
        cy.wait(2000);

        // Verify that the users are displayed in ascending order
        const afterAscSortList = getTableColumnData(user);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by user in descending order
        sortDesc(user);
        cy.wait(2000);

        // Verify that the users are displayed in descending order
        const afterDescSortList = getTableColumnData(user);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("File name sort validations", function () {
        // Navigate to application inventory page and open manage imports
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(csvFileName);

        // Sort the manage imports by file name in ascending order
        sortAsc(csvFileName);
        cy.wait(2000);

        // Verify that the file names are displayed in ascending order
        const afterAscSortList = getTableColumnData(csvFileName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by file name in descending order
        sortDesc(csvFileName);
        cy.wait(2000);

        // Verify that the file names are displayed in descending order
        const afterDescSortList = getTableColumnData(csvFileName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Import status sort validations", function () {
        // Navigate to application inventory page and open manage imports
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");
        openManageImportsPage();

        // Get unsorted list when page loads
        const unsortedList = getTableColumnData(importStatus);

        // Sort the manage imports by status in ascending order
        sortAsc(importStatus);
        cy.wait(2000);

        // Verify that the import status rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(importStatus);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the manage imports by status in descending order
        sortDesc(importStatus);
        cy.wait(2000);

        // Verify that the import status rows are displayed in descending order
        const afterDescSortList = getTableColumnData(importStatus);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
