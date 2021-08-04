/// <reference types="cypress" />

import {
    clickByText,
    exists,
    importApplication,
    login,
    openManageImportsPage,
    openErrorReport,
    verifyAppImport,
    verifyImportErrorMsg,
} from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { BusinessServices } from "../../../models/businessservices";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory, button } from "../../../types/constants";

const businessService = new BusinessServices("Finance and HR");
const filePath = "app_import/";
var applicationsList: Array<ApplicationInventory> = [];

describe("Application import operations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        // Create business service
        businessService.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Delete the business service
        businessService.delete();

        // Delete the applications
        if (applicationsList) {
            applicationsList.forEach(function (application) {
                application.delete();
            });
        }
    });

    it("Valid applications import", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import valid csv
        const fileName = "valid_application_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Import-app-1");
        exists("Import-app-2");

        // Create objects for imported apps
        for (let i = 1; i <= 2; i++) {
            const importedApp = new ApplicationInventory(`Import-app-${i}`);
            applicationsList.push(importedApp);
        }

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 2, 0);
    });

    it("Duplicate applications import", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import already imported valid csv file
        const fileName = "valid_application_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 2);

        // Verify the error report messages
        openErrorReport();
        var errorMsgs = [
            "Duplicate ApplicationName in table: Import-app-1",
            "Duplicate ApplicationName in table: Import-app-2",
        ];
        verifyImportErrorMsg(errorMsgs);
    });

    it("Applications import for non existing tags and business service", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import csv with non-existent businsess service and tag rows
        const fileName = "non_existing_tags_business_service_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 2);

        // Verify the error report messages
        openErrorReport();
        var errorMsgs = [
            "Business Service: Finance does not exist",
            "Tag Type Database and Tag H2O combination does not exist",
        ];
        verifyImportErrorMsg(errorMsgs);
    });

    it("Applications import with minimum required field(s) and empty row", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import csv with an empty row between two valid rows having minimum required field(s)
        const fileName = "mandatory_and_empty_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Import-app-5");
        exists("Import-app-6");

        // Create objects for imported apps
        for (let i = 5; i <= 6; i++) {
            const importedApp = new ApplicationInventory(`Import-app-${i}`);
            applicationsList.push(importedApp);
        }

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 2, 1);

        // Verify the error report message
        openErrorReport();
        verifyImportErrorMsg("Application Name is mandatory");
    });

    it("Applications import having same name with spaces", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import csv having same name applications differentitated by whitespaces
        const fileName = "app_name_with_spaces.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Create object for imported app
        const importedApp = new ApplicationInventory("Import-app-7");
        applicationsList.push(importedApp);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        // Fails due to bug - https://issues.redhat.com/browse/TACKLE-274
        verifyAppImport(fileName, "Completed", 1, 1);

        // Verify the error report message
        openErrorReport();
        verifyImportErrorMsg("Duplicate ApplicationName in table: Import-app-7");
    });

    it("Applications import having description and comments exceeding allowed limits", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Import csv having description and comments over the allowed limits
        // Fails due to bug - https://issues.redhat.com/browse/TACKLE-268
        const fileName = "desc_comments_char_limit_rows.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 2);
    });
});
