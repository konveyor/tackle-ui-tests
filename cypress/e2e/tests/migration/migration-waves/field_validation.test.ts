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

import { login, validateTooLongInput, validateTooShortInput } from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { MigrationWaveView } from "../../../views/migration-wave.view";
import { cancelButton, nameHelper } from "../../../views/common.view";

let migrationWave: MigrationWave;

// Automates validations for Polarion TC 332
// This suite is only for fields validations, see crud.test.ts for CRUD operations
describe(["@tier1"], "Migration Waves Validations", () => {
    before("Login and create test data", function () {
        login();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const end = new Date(tomorrow.getTime());
        end.setFullYear(end.getFullYear() + 1);

        migrationWave = new MigrationWave(data.getRandomWord(8), tomorrow, end);
        migrationWave.create();
    });

    it("Bug MTA-906 | Name validations", function () {
        MigrationWave.openNewForm();
        cy.get(MigrationWaveView.submitButton).should("be.disabled");

        validateTooShortInput(MigrationWaveView.nameInput, "body");
        validateTooLongInput(MigrationWaveView.nameInput);

        cy.get(MigrationWaveView.submitButton).should("be.disabled");
        cy.get(cancelButton).click();
    });

    it("Dates Validations", function () {
        MigrationWave.openNewForm();
        MigrationWave.fillName(data.getRandomWord(5));
        cy.get(MigrationWaveView.submitButton).should("be.disabled");

        const now = new Date();
        cy.get(MigrationWaveView.startDateInput).next("button").click();
        const tomorrow = new RegExp("^" + (now.getDate() + 1) + "$");
        // Start date should be greater than actual date
        cy.contains("button", new RegExp("^" + now.getDate() + "$")).should("be.disabled");
        cy.contains("button", tomorrow).should("be.enabled").click();

        cy.get(MigrationWaveView.endDateInput).next("button").click();
        // End date should be greater than start date
        cy.contains("button", tomorrow).should("be.disabled");
        cy.contains("button", new RegExp("^" + (now.getDate() + 2) + "$"))
            .should("be.enabled")
            .click();

        cy.get(MigrationWaveView.submitButton).should("be.enabled");
        cy.get(cancelButton).click();
    });

    after("Delete test data", function () {
        migrationWave.delete();
    });
});
