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
    createMultipleMigrationWaves,
    deleteByList,
} from "../../../../utils/utils";
import * as commonView from "../../../views/common.view";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { MigrationWaveView } from "../../../views/migration-wave.view";

let migrationWavesList: MigrationWave[] = [];
//Automates Polarion TC 357
describe(["@tier3"], "Migration Waves pagination validations", function () {
    before("Login and Create Test Data", function () {
        login();
        migrationWavesList = createMultipleMigrationWaves(11);
    });

    it("Bug MTA-1281: Navigation button validations", function () {
        MigrationWave.open();
        selectItemsPerPage(10);

        // Verify next buttons are enabled as there are more than 10 rows present
        cy.get(commonView.nextPageButton).each(($nextBtn) => {
            cy.wrap($nextBtn).should("not.be.disabled");
        });

        // Verify that previous buttons are disabled being on the first page
        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("be.disabled");
        });

        cy.get(commonView.lastPageButton).should("not.be.disabled");

        cy.get(commonView.firstPageButton).should("be.disabled");

        // Navigate to next page
        cy.get(commonView.nextPageButton).eq(0).click();

        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        cy.get(commonView.firstPageButton).should("not.be.disabled");
    });

    it("Bug MTA-1281: Items per page validations", function () {
        MigrationWave.open();

        selectItemsPerPage(10);

        // Verify that only 10 items are displayed
        cy.get(MigrationWaveView.migrationWavesTable)
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("eq", 10);
            });

        selectItemsPerPage(20);

        // Verify that items less than or equal to 20 and greater than 10 are displayed
        cy.get(MigrationWaveView.migrationWavesTable)
            .find("td[data-label=Name]")
            .then(($rows) => {
                cy.wrap($rows.length).should("be.lte", 20).and("be.gt", 10);
            });
    });

    it("Bug MTA-1281: Page number validations", function () {
        MigrationWave.open();
        selectItemsPerPage(10);

        goToPage(2);

        cy.get(commonView.prevPageButton).each(($previousBtn) => {
            cy.wrap($previousBtn).should("not.be.disabled");
        });

        goToPage(1);
    });

    after("Bug MTA-1281: Perform test data clean up", function () {
        deleteByList(migrationWavesList);
    });
});
