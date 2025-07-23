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

import * as data from "../../../../utils/data_utils";
import {
    checkSuccessAlert,
    clickJs,
    createMultipleMigrationWaves,
    deleteByList,
    login,
    validateTooLongInput,
    validateTooShortInput,
} from "../../../../utils/utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { duplicateMigrationWaveError } from "../../../types/constants";
import * as commonView from "../../../views/common.view";
import { cancelButton } from "../../../views/common.view";
import { MigrationWaveView } from "../../../views/migration-wave.view";

let migrationWave: MigrationWave;

// Automates validations for Polarion TC 332
// This suite is only for fields validations, see crud.test.ts for CRUD operations
describe(["@tier2"], "Migration Waves Validations", () => {
    before("Login and create test data", function () {
        login();
        cy.visit("/");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const end = new Date(tomorrow.getTime());
        end.setFullYear(end.getFullYear() + 1);

        migrationWave = new MigrationWave(data.getRandomWord(8), tomorrow, end);
        migrationWave.create();
    });

    beforeEach("Clear state", function () {
        MigrationWave.open(true);
    });

    it("Name validations", function () {
        const invalidMessage = "Name is invalid. The name must be between 3 and 120 characters";
        MigrationWave.openNewForm();
        cy.get(commonView.submitButton).should("be.disabled");

        validateTooShortInput(MigrationWaveView.nameInput, "body", invalidMessage);
        validateTooLongInput(MigrationWaveView.nameInput, 121, null, invalidMessage);

        cy.get(commonView.submitButton).should("be.disabled");
        clickJs(cancelButton);
    });

    it("Dates Validations", function () {
        MigrationWave.openNewForm();
        MigrationWave.fillName(data.getRandomWord(5));
        cy.get(commonView.submitButton).should("be.disabled");
        const now = new Date();

        const options = { year: "numeric", month: "long", day: "numeric" } as const;
        //used to get a date format such as "9 August 2023"
        const nowDateLabel = new Intl.DateTimeFormat("en-GB", options).format(now);

        cy.get(MigrationWaveView.startDateInput)
            .closest(MigrationWaveView.generalDatePicker)
            .find(MigrationWaveView.calendarButton)
            .click();
        // Start date can be today's date and after.
        cy.get(`button[aria-label="${nowDateLabel}"]`).should("be.enabled").click();

        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const dateTomorrowLabel = new Intl.DateTimeFormat("en-GB", options).format(tomorrow);
        cy.get(MigrationWaveView.endDateInput)
            .closest(MigrationWaveView.generalDatePicker)
            .find(MigrationWaveView.calendarButton)
            .click();
        // End date should be greater than start date
        cy.get(`button[aria-label="${nowDateLabel}"]`).should("be.disabled");
        cy.get(`button[aria-label="${dateTomorrowLabel}"]`)
            .eq(1)
            .should("be.enabled")
            .click({ force: true, multiple: true });
        cy.get(commonView.submitButton).should("be.enabled");
        clickJs(cancelButton);
    });

    it("Duplicate Migration wave name validation", function () {
        const migrationWavesList: MigrationWave[] = createMultipleMigrationWaves(2);

        migrationWavesList[0].create();
        checkSuccessAlert(commonView.alertTitle, duplicateMigrationWaveError);

        migrationWavesList[1].create();
        checkSuccessAlert(commonView.alertTitle, duplicateMigrationWaveError);

        deleteByList(migrationWavesList);
    });

    after("Delete test data", function () {
        migrationWave.delete();
    });
});
