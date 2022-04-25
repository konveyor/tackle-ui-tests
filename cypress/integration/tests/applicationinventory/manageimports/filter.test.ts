/// <reference types="cypress" />

import {
    login,
    clickByText,
    importApplication,
    openManageImportsPage,
    applySearchFilter,
    exists,
    deleteApplicationTableRows,
    preservecookies,
    hasToBeSkipped,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationInventory, button, clearAllFilters } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";

import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { BusinessServices } from "../../../models/businessservices";
import { csvFileName } from "../../../views/applicationinventory.view";

const businessService = new BusinessServices("Finance and HR");
const filePath = "app_import/";
var applicationsList: Array<ApplicationInventory> = [];
const filesToImport = [
    "valid_application_rows.csv",
    "mandatory_and_empty_rows.csv",
    "non_existing_tags_business_service_rows.csv",
];
var invalidSearchInput = String(data.getRandomNumber());

describe("Manage applications import filter validations", { tags: "@tier2" }, function () {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        // Delete all items of page
        deleteApplicationTableRows();

        // Create business service
        businessService.create();

        // Open the application inventory page
        clickByText(navMenu, applicationInventory);
        cy.wait(2000);

        // Import multiple csv files
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
        cy.intercept("GET", "/hub/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the business service
        businessService.delete();
        deleteApplicationTableRows();
    });

    it("File name filter validations", function () {
        // Navigate to application inventory page and open manage imports
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplications");
        openManageImportsPage();

        // Enter an existing file name substring and apply it as search filter
        var validSearchInput = filesToImport[0].substring(0, 5);
        applySearchFilter(csvFileName, validSearchInput);

        // Assert that application import row(s) containing the search text is/are displayed
        exists(filesToImport[0]);
        if (filesToImport[1].indexOf(validSearchInput) >= 0) {
            exists(filesToImport[1]);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait(2000);

        // Enter a non-existing file name substring and apply it as search filter
        applySearchFilter(csvFileName, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });
});
