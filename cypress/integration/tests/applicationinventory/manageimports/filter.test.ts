/// <reference types="cypress" />

import {
    login,
    clickByText,
    importApplication,
    openManageImportsPage,
    applySearchFilter,
    exists,
    selectItemsPerPage,
    deleteApplicationTableRows,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory, button, clearAllFilters } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import * as commonView from "../../../views/common.view";

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

describe("Manage applications import filter validations", function () {
    before("Login and create test data", function () {
        // Perform login
        login();

        // Navigate to application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait(2000);

        // Select 100 items per page
        selectItemsPerPage(100);
        cy.wait(2000);

        // Check if the application inventory table is empty, else delete the existing rows
        cy.get(commonView.appTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    // Delete all items of page
                    deleteApplicationTableRows();
                }
            });

        // Create business service
        businessService.create();

        // Open the application inventory page
        clickByText(navMenu, applicationinventory);
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
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Delete the business service
        businessService.delete();

        // Navigate to application inventory tab
        clickByText(navMenu, applicationinventory);
        cy.wait(2000);

        // Delete the applications created before the tests
        applicationsList.forEach(function (application) {
            cy.get(commonView.appTable)
                .next()
                .then(($div) => {
                    if (!$div.hasClass("pf-c-empty-state")) {
                        cy.get(".pf-c-table > tbody > tr")
                            .not(".pf-c-table__expandable-row")
                            .find("td[data-label=Name]")
                            .each(($rows) => {
                                if ($rows.text() === application.name) application.delete();
                            });
                    }
                });
        });
    });

    it("File name filter validations", function () {
        // Navigate to application inventory page and open manage imports
        clickByText(navMenu, applicationinventory);
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
