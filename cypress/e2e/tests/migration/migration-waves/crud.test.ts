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
    createMultipleApplications,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteAllStakeholders,
    deleteByList,
    login,
} from "../../../../utils/utils";
import { Application } from "../../../models/migration/applicationinventory/application";
import { Stakeholdergroups } from "../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { SEC } from "../../../types/constants";
import { successAlertMessage } from "../../../views/common.view";
import {
    getSpecialMigrationWavesTableSelector,
    MigrationWavesSpecialColumns,
    MigrationWaveView,
} from "../../../views/migration-wave.view";

let stakeHolders: Stakeholders[];
let stakeHolderGroups: Stakeholdergroups[];
let applications: Application[];

const now = new Date();

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

describe(["@tier0", "interop"], "Migration Waves CRUD operations", () => {
    before("Create test data", () => {
        login();
        cy.visit("/");
        stakeHolders = createMultipleStakeholders(2);
        stakeHolderGroups = createMultipleStakeholderGroups(2);
    });

    beforeEach("Login", function () {
        cy.intercept("POST", "/hub/migrationwaves*").as("postWave");
        cy.intercept("PUT", "/hub/migrationwaves*/*").as("putWave");
        cy.intercept("DELETE", "/hub/migrationwaves*/*").as("deleteWave");
        cy.visit("/");
    });

    // Automates Polarion TC 332
    it("Migration Wave CRUD", function () {
        const migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            stakeHolders,
            stakeHolderGroups
        );

        // Create
        migrationWave.create();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Migration wave ${migrationWave.name} was successfully created.`,
            true
        );
        cy.wait("@postWave");
        cy.get("td", { timeout: 12 * SEC }).should("contain", migrationWave.name);

        // Edit
        const newName = data.getRandomWord(8);
        migrationWave.edit({ name: newName });
        checkSuccessAlert(
            successAlertMessage,
            "Success alert:Migration wave was successfully saved.",
            true
        );
        cy.wait("@putWave");
        cy.get("td", { timeout: 12 * SEC }).should("contain", newName);
        migrationWave.name = newName;

        // Delete
        migrationWave.delete();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Migration wave ${migrationWave.name} was successfully deleted.`,
            true
        );
        cy.wait("@deleteWave");
        cy.get("td", { timeout: 12 * SEC }).should("not.contain", newName);
    });

    // Automates Polarion TC 333
    it("Migration Wave Application Association", function () {
        applications = createMultipleApplications(2);
        const migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            stakeHolders,
            stakeHolderGroups,
            applications
        );
        migrationWave.create();

        verifySpecialColumnCount(migrationWave, MigrationWavesSpecialColumns.Stakeholders, 2);
        verifySpecialColumnCount(migrationWave, MigrationWavesSpecialColumns.Applications, 2);

        // Clicks the Application number
        cy.contains("td", migrationWave.name)
            .siblings(MigrationWaveView.applicationCountColumn)
            .click();

        const applicationTableSelector = getSpecialMigrationWavesTableSelector(
            migrationWave,
            MigrationWavesSpecialColumns.Applications
        );

        // Verifies the application names
        cy.get(applicationTableSelector)
            .should("contain", applications[0].name)
            .and("contain", applications[1].name);

        // Delete all applications by clicking the delete buttons
        cy.get(applicationTableSelector + " td > button").each((btn) => {
            cy.wrap(btn).click();
            cy.contains("Delete").click();
        });
        migrationWave.applications = [];

        verifySpecialColumnCount(migrationWave, MigrationWavesSpecialColumns.Applications, 0);

        migrationWave.delete();
    });

    after("Clear test data", function () {
        deleteAllStakeholders();
        deleteByList(stakeHolderGroups);
        deleteByList(applications);
    });

    const verifySpecialColumnCount = (
        wave: MigrationWave,
        column: MigrationWavesSpecialColumns,
        expectedCount: number
    ) => {
        cy.contains("td", wave.name)
            .siblings(`td[data-label='${column}']`)
            .should("contain", expectedCount);
    };
});
