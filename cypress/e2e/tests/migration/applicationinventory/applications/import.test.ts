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

import { tdTag, trTag } from "../../../../../e2e/types/constants";
import {
    deleteAllBusinessServices,
    deleteAllMigrationWaves,
    deleteAppImportsTableRows,
    deleteApplicationTableRows,
    exists,
    importApplication,
    login,
} from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { ManageImports } from "../../../../models/migration/applicationinventory/manageImports";

const imports = new ManageImports();
const filePath = "app_import/csv/";

describe(["@tier3"], "Application import operations", () => {
    before("Login and create test data", function () {
        login();
        cy.visit("/");
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
    });

    beforeEach("Persist session", function () {
        cy.intercept("GET", "/hub/application*").as("getApplication");
        deleteAppImportsTableRows();
    });

    it("Valid applications import", function () {
        Application.open();

        // Import valid csv
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway");
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 5, "-");
    });

    it("Duplicate applications import", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import already imported valid csv file
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);

        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 2, 3);
        imports.openErrorReport();
        const errorMsgs = [
            "UNIQUE constraint failed: Application.Name",
            "UNIQUE constraint failed: Application.Name",
            "UNIQUE constraint failed: Application.Name",
        ];
        imports.verifyImportErrorMsg(errorMsgs);
    });

    it("1)Applications import for non existing tags and BS \
        2)Verify assigned BS for imported application if BS was created through previous import", function () {
        Application.open();
        cy.wait("@getApplication");
        // Import csv with non-existent tags
        // tag and BS should get created.
        const fileName = "missing_tags_and_bs.csv";
        importApplication(filePath + fileName, true);
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 2, "-");

        // Automate bug MTA-4257, Polarion TC MTA-609
        const fileName2 = "lantik_bug.csv";
        importApplication(filePath + fileName2, true);
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 1, "-");
        Application.open();
        exists("App_bug4257");
        cy.get(tdTag)
            .contains("App_bug4257")
            .closest(trTag)
            .within(() => {
                cy.get("td[data-label='Business Service']").should("contain.text", "Finance");
            });
    });

    it("Applications import with minimum required field(s) and empty row", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv with an empty row between two valid rows having minimum required field(s)
        const fileName = "mandatory_and_empty_row_21.csv";
        importApplication(filePath + fileName);
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 2, 1);
        imports.openErrorReport();
        imports.verifyImportErrorMsg("Empty Record Type");
    });

    it("Applications import having same name with spaces", function () {
        Application.open();
        cy.wait("@getApplication");

        // Import csv having applications with same name, differentiated by whitespaces
        const fileName = "app_name_with_spaces_21.csv";
        importApplication(filePath + fileName);
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 1, 1);
        imports.openErrorReport();
        imports.verifyImportErrorMsg("UNIQUE constraint failed: Application.Name");
    });

    it("Applications import for invalid csv schema", function () {
        // Impacted by bug - https://issues.redhat.com/browse/TACKLE-320
        Application.open();
        cy.wait("@getApplication");

        // Import csv invalid schema
        const fileName = "invalid_schema_21.csv";
        importApplication(filePath + fileName);
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 0, 2);
        const errorMsgs = ["Invalid or unknown Record Type", "Invalid or unknown Record Type"];
        imports.openErrorReport();
        imports.verifyImportErrorMsg(errorMsgs);
    });

    it("Application import with invalid record type", function () {
        // The only valid record types for records in a CSV file are 1(application) or 2(dependency).
        // In this test, we import a CSV file that has records with a record type that's neither 1 nor 2.
        // Automates https://issues.redhat.com/browse/TACKLE-634
        Application.open();
        cy.wait("@getApplication");

        const fileName = "invalid_record_type_21.csv";
        importApplication(filePath + fileName);
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 0, 2);
        const errorMsgs = [
            "Invalid or unknown Record Type '3'. Must be '1' for Application or '2' for Dependency.",
            "Invalid or unknown Record Type '100'. Must be '1' for Application or '2' for Dependency.",
        ];
        imports.openErrorReport();
        imports.verifyImportErrorMsg(errorMsgs);
    });

    it("Import .CSV file with missing application name", function () {
        // Automates Polarion MTA-368
        Application.open();
        cy.wait("@getApplication");

        const fileName = "missing_application_name.csv";
        importApplication(filePath + fileName);
        ManageImports.open();
        imports.verifyAppImport(fileName, "Completed", 0, 1);
        const errorMsg = ["Application Name is mandatory."];
        imports.openErrorReport();
        imports.verifyImportErrorMsg(errorMsg);
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteApplicationTableRows();
        deleteAllBusinessServices();
    });
});
