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
} from "../../../../../utils/utils";
import { ApplicationInventory } from "../../../../models/developer/applicationinventory/applicationinventory";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";
import { navMenu } from "../../../../views/menu.view";
import { applicationInventory, button } from "../../../../types/constants";

const businessService = new BusinessServices("Retail");
const filePath = "app_import/csv/";
var applicationsList: Array<ApplicationInventory> = [];

describe("Application import operations", () => {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Delete the existing application rows
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        // Create business service
        businessService.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
        deleteAppImportsTableRows();
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1") && hasToBeSkipped("@newtest")) return;

        // Delete the existing application rows before deleting business service(s)
        deleteApplicationTableRows();

        // Delete the business service
        businessService.delete();
    });

    it("Valid applications import", { tags: "@tier1" }, function () {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplication");

        // Import valid csv
        const fileName = "template_application_import.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Verify imported apps are visible in table
        exists("Customers");
        exists("Inventory");
        exists("Gateway");

        // Create objects for imported apps
        for (let i = 1; i <= 3; i++) {
            const importedApp = new ApplicationInventory(`Import-app-${i}`, businessService.name);
            applicationsList.push(importedApp);
        }

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 5, 0);
    });

    it("Duplicate applications import", { tags: "@tier1" }, function () {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
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

    it(
        "Applications import for non existing tags and business service",
        { tags: "@tier1" },
        function () {
            selectUserPerspective("Developer");
            clickByText(navMenu, applicationInventory);
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
        }
    );

    it(
        "Applications import with minimum required field(s) and empty row",
        { tags: "@tier1" },
        function () {
            selectUserPerspective("Developer");
            clickByText(navMenu, applicationInventory);
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
                const importedApp = new ApplicationInventory(
                    `Import-app-${i}`,
                    businessService.name
                );
                applicationsList.push(importedApp);
            }

            // Open application imports page
            openManageImportsPage();

            // Verify import applications page shows correct information
            verifyAppImport(fileName, "Completed", 2, 1);

            // Verify the error report message
            openErrorReport();
            verifyImportErrorMsg("Invalid Record Type");
        }
    );

    it("Applications import having same name with spaces", { tags: "@tier1" }, function () {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplication");

        // Import csv having applications with same name, differentiated by whitespaces
        const fileName = "app_name_with_spaces.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Completed", 0, 2);

        // Verify the error report message
        openErrorReport();
        const errorMsgs = [
            "Duplicate Application Name within file: Import-app-7",
            "Duplicate Application Name within file: Import-app-7",
        ];
        verifyImportErrorMsg(errorMsgs);
    });

    it(
        "Applications import having description and comments exceeding allowed limits",
        { tags: "@tier1" },
        function () {
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
        }
    );

    it("Applications import for invalid csv schema", { tags: "@newtest" }, function () {
        // Impacted by bug - https://issues.redhat.com/browse/TACKLE-320
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplication");

        // Import csv invalid schema
        const fileName = "invalid_column_schema.csv";
        importApplication(filePath + fileName);
        cy.wait(2000);

        // Open application imports page
        openManageImportsPage();

        // Verify import applications page shows correct information
        verifyAppImport(fileName, "Error", 0, 2);

        // Verify if error is reported and link to documentation is present and working
        cy.get("table > tbody > tr")
            .eq(0)
            .find("td[data-label='Status']")
            .find("div")
            .contains("button", "Error")
            .click();
        cy.wait(500);
        cy.get("div.pf-c-popover__content")
            .find("footer")
            .find("a")
            .then(($anchor) => {
                var doc_link = $anchor.attr("href").toString();
                cy.request(doc_link).then((resp) => {
                    expect(resp.status).to.eq(200);
                });
            });
    });
});
