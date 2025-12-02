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

import * as data from "../../../../../utils/data_utils";
import {
    applySearchFilter,
    clickByText,
    deleteAllMigrationWaves,
    deleteAppImportsTableRows,
    deleteApplicationTableRows,
    exists,
    importApplication,
    login,
    openManageImportsPage,
} from "../../../../../utils/utils";
import { button, clearAllFilters } from "../../../../types/constants";

import { Application } from "../../../../models/migration/applicationinventory/application";
import { FileName } from "../../../../views/applicationinventory.view";

const filePath = "app_import/csv/";
const filesToImport = [
    "valid_application_rows.csv",
    "mandatory_and_empty_rows.csv",
    "non_existing_tags_business_service_rows.csv",
];
const invalidSearchInput = String(data.getRandomNumber());

describe(["@tier3"], "Manage applications import filter validations", function () {
    before("Login and create test data", function () {
        login();
        cy.visit("/");
        Application.open();

        // Import multiple csv files
        filesToImport.forEach(function (csvFile) {
            importApplication(filePath + csvFile);
        });
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplications");
    });

    it("File name filter validations", function () {
        // Navigate to application inventory page and open manage imports
        Application.open();
        openManageImportsPage();

        // Enter an existing file name substring and apply it as search filter
        const validSearchInput = filesToImport[0].substring(0, 5);
        applySearchFilter(FileName, validSearchInput);

        // Assert that application import row(s) containing the search text is/are displayed
        exists(filesToImport[0]);
        if (filesToImport[1].indexOf(validSearchInput) >= 0) {
            exists(filesToImport[1]);
        }

        clickByText(button, clearAllFilters);

        // Enter a non-existing file name substring and apply it as search filter
        applySearchFilter(FileName, invalidSearchInput);
        cy.get("h2").contains("No import summary available");
    });

    after("Perform test data clean up", function () {
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
    });
});
