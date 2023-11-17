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
    selectItemsPerPage,
    deleteByList,
    createMultipleApplications,
    goToPage,
    validatePagination,
} from "../../../../../utils/utils";
import * as commonView from "../../../../views/common.view";
import { Application } from "../../../../models/migration/applicationinventory/application";

let applicationsList: Array<Application> = [];

describe(["@tier3"], "Application inventory pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        applicationsList = createMultipleApplications(11);
    });

    beforeEach("Persist session", function () {
        // Interceptors for Applications
        cy.intercept("GET", "/hub/application*").as("getApplications");
    });

    it("Navigation button validations", function () {
        // Navigate to Application inventory tab
        Application.open();
        cy.wait("@getApplications");
        selectItemsPerPage(10);
        validatePagination();
    });

    it("Items per page validations", function () {
        // Navigate to Application inventory tab
        Application.open();
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Verify that only 10 items are displayed
        cy.get(commonView.appTable)
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });

        // Select 20 items per page
        selectItemsPerPage(20);
        cy.wait(2000);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get(commonView.appTable)
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
            });
    });

    it("Page number validations", function () {
        // Navigate to Application inventory tab
        Application.open();
        cy.wait("@getApplications");

        // Select 10 items per page
        selectItemsPerPage(10);
        cy.wait(2000);

        // Go to page number 2
        goToPage(2);

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Go back to page number 1
        goToPage(1);
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationsList);
    });
});
