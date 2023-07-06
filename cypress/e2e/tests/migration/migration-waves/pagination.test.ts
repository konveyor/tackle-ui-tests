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
    goToPage,
    goToLastPage,
    deleteAllMigrationWaves,
    createMultipleMigrationWaves,
} from "../../../../utils/utils";
import * as commonView from "../../../views/common.view";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";

let migrationWavesList: MigrationWave[] = [];

describe(["@tier3"], "Application inventory pagination validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();
        deleteAllMigrationWaves();
        // Navigate to Migration Waves tab, delete all and create 11 migration waves
        migrationWavesList = createMultipleMigrationWaves(11);
    });

    after("Perform test data clean up", function () {
        // Delete the Migration Waves created before the tests
        deleteAllMigrationWaves();
    });

    it("Navigation button validations", function () {
        MigrationWave.open();
        // select 10 items per page
        selectItemsPerPage(10);

        // Verify next buttons are enabled as there are more than 11 rows present
        cy.get(commonView.nextPageButton).each(($nextBtn) => {
            cy.wrap($nextBtn).should("not.be.disabled");
        });

        // Verify that previous buttons are disabled being on the first page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("be.disabled");
        });

        // Verify that navigation button to last page is enabled
        cy.get(commonView.lastPageButton).should("not.be.disabled");

        // Verify that navigation button to first page is disabled being on the first page
        cy.get(commonView.firstPageButton).should("be.disabled");

        // Navigate to next page
        cy.get(commonView.nextPageButton).eq(0).click();

        // Verify that previous buttons are enabled after moving to next page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Verify that navigation button to first page is enabled after moving to next page
        cy.get(commonView.firstPageButton).should("not.be.disabled");
    });

    it("Items per page validations", function () {
        MigrationWave.open();

        // Select 10 items per page
        selectItemsPerPage(10);

        // Verify that only 10 items are displayed
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });

        selectItemsPerPage(20);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
            });
    });

    it("Page number validations", function () {
        MigrationWave.open();
        -selectItemsPerPage(10);

        // Go to page number 2
        goToPage(2);

        // Verify that page number has changed, as previous page nav button got enabled
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        // Go back to page number 1
        goToPage(1);
    });

    it("Last page item(s) deletion, impact on page reload validation", function () {
        MigrationWave.open();

        // Select 10 items per page
        selectItemsPerPage(10);

        goToLastPage();

        // Delete all items of last page
        deleteAllMigrationWaves(true);

        // Verify that page is re-directed to previous page
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });
    });
});
