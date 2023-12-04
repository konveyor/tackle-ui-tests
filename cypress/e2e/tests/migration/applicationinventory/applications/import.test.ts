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
    exists,
    importApplication,
    login,
    openManageImportsPage,
    openErrorReport,
    verifyAppImport,
    verifyImportErrorMsg,
    deleteApplicationTableRows,
    deleteAllBusinessServices,
    deleteAppImportsTableRows,
    notExists,
} from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Application } from "../../../../models/migration/applicationinventory/application";

const filePath = "app_import/csv/";

describe(["@tier2"], "Application import operations", () => {
    before("Login and create test data", function () {
        login();
    });

    beforeEach("Persist session", function () {
        cy.intercept("GET", "/hub/application*").as("getApplication");
        deleteAppImportsTableRows();
    });

    it("Bug MTA-1716: Valid applications import", function () {
        Application.open();

        // Import valid csv
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway");

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 5, 0);
    });

    it("Bug MTA-1716: Duplicate applications import", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import already imported valid csv file
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 2, 3);

        openErrorReport();
        const errorMsgs = [
            "UNIQUE constraint failed: Application.Name",
            "UNIQUE constraint failed: Application.Name",
            "UNIQUE constraint failed: Application.Name",
        ];
        verifyImportErrorMsg(errorMsgs);
    });

    it("Bug MTA-1716: Applications import for non existing tags", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv with non-existent tags
        const fileName = "missing_tags_21.csv";
        importApplication(filePath + fileName, true);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 0, 1);

        openErrorReport();
        verifyImportErrorMsg("Tag 'TypeScript' could not be found");
    });

    it("Bug MTA-1716: Applications import for non existing business service", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv with non-existent business service
        const fileName = "missing_business_21.csv";
        importApplication(filePath + fileName, true);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 0, 1);

        openErrorReport();
        verifyImportErrorMsg("BusinessService 'Finance' could not be found");
    });

    it("Bug MTA-1716: Applications import with minimum required field(s) and empty row", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv with an empty row between two valid rows having minimum required field(s)
        const fileName = "mandatory_and_empty_row_21.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 2, 1);

        openErrorReport();
        verifyImportErrorMsg("Empty Record Type");
    });

    it("Bug MTA-1716: Applications import having same name with spaces", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv having applications with same name, differentiated by whitespaces
        const fileName = "app_name_with_spaces_21.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 1, 1);

        openErrorReport();
        verifyImportErrorMsg("UNIQUE constraint failed: Application.Name");
    });

    it("Bug MTA-1716: Applications import for invalid csv schema", function () {
        // Impacted by bug - https://issues.redhat.com/browse/TACKLE-320
        Application.open();
        cy.wait("@getApplication");

        // Import csv invalid schema
        const fileName = "invalid_schema_21.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 0, 2);

        const errorMsgs = ["Invalid or unknown Record Type", "Invalid or unknown Record Type"];
        openErrorReport();
        verifyImportErrorMsg(errorMsgs);
    });

    it("Bug MTA-1716: Application import with invalid record type", function () {
        // The only valid record types for records in a CSV file are 1(application) or 2(dependency).
        // In this test, we import a CSV file that has records with a record type that's neither 1 nor 2.
        // Automates https://issues.redhat.com/browse/TACKLE-634
        Application.open();
        cy.wait("@getApplication");

        const fileName = "invalid_record_type_21.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 0, 2);

        const errorMsgs = [
            "Invalid or unknown Record Type '3'. Must be '1' for Application or '2' for Dependency.",
            "Invalid or unknown Record Type '100'. Must be '1' for Application or '2' for Dependency.",
        ];

        openErrorReport();
        verifyImportErrorMsg(errorMsgs);
    });

    it("Bug MTA-1716: Import .CSV file with missing application name", function () {
        // Automates Polarion MTA-368
        Application.open();
        cy.wait("@getApplication");

        const fileName = "missing_application_name.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        openManageImportsPage();

        verifyAppImport(fileName, "Completed", 0, 1);

        const errorMsg = ["Application Name is mandatory."];
        openErrorReport();
        verifyImportErrorMsg(errorMsg);
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteApplicationTableRows();
        deleteAllBusinessServices();
    });
});
