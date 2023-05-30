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
    exists,
    importApplication,
    login,
    openManageImportsPage,
    openErrorReport,
    verifyAppImport,
    verifyImportErrorMsg,
    deleteApplicationTableRows,
    preservecookies,
    hasToBeSkipped,
    selectUserPerspective,
    deleteAllBusinessServices,
    deleteAppImportsTableRows,
    notExists,
} from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { navMenu } from "../../../../views/menu.view";
import { applicationInventory, button, SEC } from "../../../../types/constants";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { Application } from "../../../../models/migration/applicationinventory/application";

const businessService = new BusinessServices("BS_tag_test");
const filePath = "app_import/csv/";
var applicationsList: Array<Assessment> = [];

describe(["@tier2"], "Application import operations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        // Delete the existing application rows
        deleteApplicationTableRows();
        deleteAllBusinessServices();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
        deleteAppImportsTableRows();
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
    });

    it("Valid applications import", function () {
        Application.open();

        // Import valid csv
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway");

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 5, 0);
    });

    it("Duplicate applications import", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import already imported valid csv file
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 2, 3);

        // Verify the error report messages
        openErrorReport();
        var errorMsgs = [
            "UNIQUE constraint failed: Application.Name",
            "UNIQUE constraint failed: Application.Name",
            "UNIQUE constraint failed: Application.Name",
        ];
        verifyImportErrorMsg(errorMsgs);
    });

    it("Applications import for non existing tags", function () {
        businessService.create();
        exists(businessService.name);
        Application.open();
        cy.wait("@getApplication");

        // Import csv with non-existent tags
        const fileName = "missing_tags_21.csv";
        importApplication(filePath + fileName, true);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 1);

        // Verify the error report messages
        openErrorReport();
        verifyImportErrorMsg("Tag 'TypeScript' could not be found");

        businessService.delete();
        notExists(businessService.name);
    });

    it("Applications import for non existing business service", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv with non-existent businsess service
        const fileName = "missing_business_21.csv";
        importApplication(filePath + fileName, true);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 1);

        // Verify the error report messages
        openErrorReport();
        verifyImportErrorMsg("BusinessService 'Finance' could not be found");
    });

    it("Applications import with minimum required field(s) and empty row", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv with an empty row between two valid rows having minimum required field(s)
        const fileName = "mandatory_and_empty_row_21.csv";
        importApplication(filePath + fileName);
        cy.wait(4 * SEC);

        /* // Verify imported apps are visible in table
            exists("Import-app-5");
            exists("Import-app-6");
            // ToDO: need to modify exists method doesn't work here
            */

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 2, 1);

        // Verify the error report message
        openErrorReport();
        verifyImportErrorMsg("Empty Record Type");
    });

    it("Applications import having same name with spaces", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv having applications with same name, differentiated by whitespaces
        const fileName = "app_name_with_spaces_21.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 1, 1);

        // Verify the error report message
        openErrorReport();
        verifyImportErrorMsg("UNIQUE constraint failed: Application.Name");
    });

    it("Applications import having description and comments exceeding allowed limits", function () {
        /*
            // Unresolved 2.1 bug - https://issues.redhat.com/browse/TACKLE-738
            selectUserPerspective("Developer");
            clickByText(navMenu, applicationInventory);
            cy.wait("@getApplication");

            // Import csv having description and comments over the allowed limits
            const fileName = "desc_comments_char_limit_rows.csv";
            importApplication(filePath + fileName);
            cy.wait(2000);

            // Open application imports page
            openManageImportsPage();

            // Verify import applications page shows correct information
            verifyAppImport(fileName, "Completed", 0, 2);
        */
    });

    it("Applications import for invalid csv schema", function () {
        // Impacted by bug - https://issues.redhat.com/browse/TACKLE-320
        Application.open();
        cy.wait("@getApplication");

        // Import csv invalid schema
        const fileName = "invalid_schema_21.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 2);

        var errorMsgs = ["Invalid or unknown Record Type", "Invalid or unknown Record Type"];

        // Verify the error report message
        openErrorReport();
        verifyImportErrorMsg(errorMsgs);
    });

    it("Applications import for with inavlid record type", function () {
        // The only valid record types for records in a CSV file are 1(application) or 2(dependency).
        // In this test, we import a CSV file that has records with a record type that's neither 1 nor 2.
        // Automates https://issues.redhat.com/browse/TACKLE-634
        Application.open();
        cy.wait("@getApplication");

        // Import csv with invalid record type
        const fileName = "invalid_record_type_21.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 2);

        var errorMsgs = [
            "Invalid or unknown Record Type '3'. Must be '1' for Application or '2' for Dependency.",
            "Invalid or unknown Record Type '100'. Must be '1' for Application or '2' for Dependency.",
        ];

        // Verify the error report message
        openErrorReport();
        verifyImportErrorMsg(errorMsgs);
    });
});
