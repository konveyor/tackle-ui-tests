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
    login,
    clickByText,
    importApplication,
    openManageImportsPage,
    applySearchFilter,
    exists,
    deleteApplicationTableRows,
    deleteAppImportsTableRows,
    deleteAllBusinessServices,
} from "../../../../../utils/utils";
import { navMenu } from "../../../../views/menu.view";
import { applicationInventory, button, clearAllFilters } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";

import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { FileName } from "../../../../views/applicationinventory.view";
import { Application } from "../../../../models/migration/applicationinventory/application";

const businessService = new BusinessServices("Finance and HR");
const filePath = "app_import/csv/";
const filesToImport = [
    "valid_application_rows.csv",
    "mandatory_and_empty_rows.csv",
    "non_existing_tags_business_service_rows.csv",
];
var invalidSearchInput = String(data.getRandomNumber());

describe(["@tier2"], "Manage applications import filter validations", function () {
    before("Login and create test data", function () {
        login();

        businessService.create();

        // Open the application inventory page
        clickByText(navMenu, applicationInventory);
        cy.wait(2000);

        // Import multiple csv files
        filesToImport.forEach(function (csvFile) {
            importApplication(filePath + csvFile);
            cy.wait(2000);
        });
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplications");
    });

    it("File name filter validations", function () {
        // Navigate to application inventory page and open manage imports
        Application.open();
        cy.wait("@getApplications");
        openManageImportsPage();

        // Enter an existing file name substring and apply it as search filter
        var validSearchInput = filesToImport[0].substring(0, 5);
        applySearchFilter(FileName, validSearchInput);

        // Assert that application import row(s) containing the search text is/are displayed
        exists(filesToImport[0]);
        if (filesToImport[1].indexOf(validSearchInput) >= 0) {
            exists(filesToImport[1]);
        }

        // Clear all filters
        clickByText(button, clearAllFilters);
        cy.wait(2000);

        // Enter a non-existing file name substring and apply it as search filter
        applySearchFilter(FileName, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
        deleteAllBusinessServices();
    });
});
