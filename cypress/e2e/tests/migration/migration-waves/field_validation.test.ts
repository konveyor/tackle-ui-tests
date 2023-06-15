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
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
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

    it("Name validations", function () {
        MigrationWave.openNewForm();
        cy.get(MigrationWaveView.submitButton).should("be.disabled");

        validateTooShortInput(MigrationWaveView.nameInput, "body");
        validateTooLongInput(CustomMigrationTargetView.nameInput);

        MigrationWave.fillName(migrationWave.name);
        cy.get(nameHelper).contains(
            "An identity with this name already exists. Use a different name."
        );

        cy.get(MigrationWaveView.submitButton).should("be.disabled");
        cy.get(cancelButton).click();
    });

    it("Dates Validations", function () {
        MigrationWave.openNewForm();
        MigrationWave.fillName(data.getRandomWord(5));
        cy.get(MigrationWaveView.submitButton).should("be.disabled");

        const now = new Date();
        cy.get(MigrationWaveView.startDateInput).next("button").click();
        // Start date should be greater than actual date
        cy.contains("button", `${now.getDate()}`).should("be.disabled");
        cy.contains("button", `${now.getDate() + 1}`)
            .should("be.enabled")
            .click();

        cy.get(MigrationWaveView.endDateInput).next("button").click();
        // End date should be greater than start date
        cy.contains("button", `${now.getDate() + 1}`).should("be.disabled");
        cy.contains("button", `${now.getDate() + 2}`)
            .should("be.enabled")
            .click();

        cy.get(MigrationWaveView.submitButton).should("be.enabled");
        cy.get(cancelButton).click();
    });

    after("Delete test data", function () {
        migrationWave.delete();
    });
});
