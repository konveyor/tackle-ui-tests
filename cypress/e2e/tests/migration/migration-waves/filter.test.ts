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
    applySearchFilter,
    clickByText,
    createMultipleMigrationWaves,
    deleteByList,
    login,
} from "../../../../utils/utils";
import { button, clearAllFilters, name } from "../../../types/constants";

import * as data from "../../../../utils/data_utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { MigrationWaveView } from "../../../views/migration-wave.view";

let migrationWavesList: Array<MigrationWave> = [];
//Automates Polarion TC 343
describe(["@tier3"], "Migration waves filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        migrationWavesList = createMultipleMigrationWaves(2);
    });

    it("Name filter validations", function () {
        MigrationWave.open();

        // Enter an existing display name substring and assert
        const validSearchInput = migrationWavesList[0].name.substring(0, 3);
        applySearchFilter(name, validSearchInput);
        cy.get("td").should("contain", migrationWavesList[0].name);
        if (migrationWavesList[1].name.indexOf(validSearchInput) >= 0) {
            cy.get("td").should("contain", migrationWavesList[1].name);
        }
        clickByText(button, clearAllFilters);

        // Enter an existing exact name and assert
        applySearchFilter(name, migrationWavesList[1].name);
        cy.get("td").should("contain", migrationWavesList[1].name);
        cy.get("td").should("not.contain", migrationWavesList[0].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, String(data.getRandomNumber()));

        // Assert that no search results are found
        cy.get(MigrationWaveView.migrationWavesTable)
            .find("h2")
            .should("contain", "No migration waves available");
        clickByText(button, clearAllFilters);
    });

    after("Perform test data clean up", function () {
        deleteByList(migrationWavesList);
    });
});
