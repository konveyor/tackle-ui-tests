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
    checkSuccessAlert,
    deleteByList,
    generateRandomDateRange,
    login,
    validateTooLongInput,
    validateTooShortInput,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { MigrationWaveView } from "../../../views/migration-wave.view";
import { cancelButton } from "../../../views/common.view";
import * as commonView from "../../../views/common.view";
import { duplicateMigrationWaveError } from "../../../types/constants";

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
        const invalidMessage = "Name is invalid. The name must be between 3 and 120 characters";
        MigrationWave.openNewForm();
        cy.get(MigrationWaveView.submitButton).should("be.disabled");

        validateTooShortInput(MigrationWaveView.nameInput, "body", invalidMessage);
        validateTooLongInput(MigrationWaveView.nameInput, 121, null, invalidMessage);

        cy.get(MigrationWaveView.submitButton).should("be.disabled");
        cy.get(cancelButton).click();
    });

    it("Dates Validations", function () {
        MigrationWave.openNewForm();
        MigrationWave.fillName(data.getRandomWord(5));
        cy.get(MigrationWaveView.submitButton).should("be.disabled");
        const now = new Date();

        const options = { year: "numeric", month: "long", day: "numeric" } as const;
        //used to get a date format such as "9 August 2023"
        const nowDateLabel = new Intl.DateTimeFormat("en-GB", options).format(now);

        cy.get(MigrationWaveView.startDateInput).next("button").click();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        const dateTomorrowLabel = new Intl.DateTimeFormat("en-GB", options).format(tomorrow);
        // Start date should be greater than actual date
        cy.get(`button[aria-label="${nowDateLabel}"]`).should("be.disabled");
        cy.get(`button[aria-label="${dateTomorrowLabel}"]`).should("be.enabled").click();

        cy.get(MigrationWaveView.endDateInput).next("button").click();
        // End date should be greater than start date
        cy.get(`button[aria-label="${dateTomorrowLabel}"]`).should("be.disabled");
        const dayAfterTomorrow = new Date(now);
        dayAfterTomorrow.setDate(now.getDate() + 2);
        const dayAfterTomorrowLabel = new Intl.DateTimeFormat("en-GB", options).format(
            dayAfterTomorrow
        );
        cy.get(`button[aria-label="${dayAfterTomorrowLabel}"]`).should("be.enabled").click();

        cy.get(MigrationWaveView.submitButton).should("be.enabled");
        cy.get(cancelButton).click();
    });
    it("Duplicate Migration wave name validation", function () {
        const migrationWavesList: MigrationWave[] = [];
        const name = data.getRandomWord(8);
        const { start: startDate, end: endDate } = generateRandomDateRange();
        const migrationWave1 = new MigrationWave(name, startDate, endDate, null, null, null);
        migrationWave1.create();
        migrationWavesList.push(migrationWave1);
        //create another MW with same params
        migrationWave1.create();
        checkSuccessAlert(commonView.duplicateNameWarning, duplicateMigrationWaveError);

        const migrationWave3 = new MigrationWave(null, startDate, endDate, null, null, null);
        migrationWave3.create();
        migrationWave3.create();
        checkSuccessAlert(commonView.duplicateNameWarning, duplicateMigrationWaveError);
        migrationWavesList.push(migrationWave3);

        //migrationwave3 name is null, so it can't be deleted by list
        deleteByList(migrationWavesList);
    });

    after("Delete test data", function () {
        migrationWave.delete();
    });
});
