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
    deleteAllImports,
    deleteAllMigrationWaves,
    deleteAppImportsTableRows,
    deleteApplicationTableRows,
    goToLastPage,
    importApplication,
    itemsPerPageValidation,
    login,
    openManageImportsPage,
    selectItemsPerPage,
    validatePagination,
} from "../../../../../utils/utils";

import { Application } from "../../../../models/migration/applicationinventory/application";
import * as commonView from "../../../../views/common.view";

const filePath = "app_import/csv/";
const filesToImport = "valid_application_rows.csv";

describe(["@tier3"], "Manage imports pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Import multiple csv files
        function importMultipleFiles(num): void {
            for (let i = 0; i < num; i++) {
                importApplication(filePath + filesToImport);
                cy.wait(2000);
            }
        }

        login();
        cy.visit("/");
        openManageImportsPage();
        importMultipleFiles(11);
    });

    beforeEach("Interceptors", function () {
        // Interceptors for Applications
        cy.intercept("GET", "/hub/application*").as("getApplications");
        cy.intercept("GET", "/hub/importsummaries*").as("getImports");
        cy.intercept("DELETE", "/hub/importsummaries*/*").as("deleteImport");
    });

    it("Navigation button validations", function () {
        Application.open();
        cy.get("@getApplications");
        openManageImportsPage();

        selectItemsPerPage(10);
        validatePagination();
    });

    it("Items per page validations", function () {
        openManageImportsPage();
        selectItemsPerPage(10);
        itemsPerPageValidation(commonView.appTable, "Filename");
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        openManageImportsPage();
        selectItemsPerPage(10);
        cy.wait("@getImports");

        // Navigate to last page
        goToLastPage();
        cy.wait("@getImports");

        deleteAllImports();

        // Verify that page is re-directed to previous page
        cy.get(commonView.appTable)
            .find("td[data-label='Filename']")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });
    });

    after("Perform test data clean up", function () {
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
    });
});
