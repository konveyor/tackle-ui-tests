import {
    checkSuccessAlert,
    createMultipleApplications,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteAllStakeholderGroups,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    login,
} from "../../../../utils/utils";
import { SEC } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../models/migration/controls/stakeholdergroups";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { successAlertMessage } from "../../../views/common.view";
import {
    getSpecialMigrationWavesTableSelector,
    MigrationWavesSpecialColumns,
    MigrationWaveView,
} from "../../../views/migration-wave.view";

let stakeHolders: Stakeholders[];
let stakeHolderGroups: Stakeholdergroups[];
const now = new Date();
now.setDate(now.getDate() + 1);

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

describe(["@tier1"], "Migration Waves CRUD operations", () => {
    before("Create test data", () => {
        login();
        stakeHolders = createMultipleStakeholders(2);
        stakeHolderGroups = createMultipleStakeholderGroups(2);
    });

    beforeEach("Login", function () {
        cy.intercept("POST", "/hub/migrationwaves*").as("postWave");
        cy.intercept("PUT", "/hub/migrationwaves*/*").as("putWave");
        cy.intercept("DELETE", "/hub/migrationwaves*/*").as("deleteWave");
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
        const applications = createMultipleApplications(2);
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
            cy.wait(3 * SEC);
        });
        migrationWave.applications = [];

        verifySpecialColumnCount(migrationWave, MigrationWavesSpecialColumns.Applications, 0);

        migrationWave.delete();
    });

    after("Clear test data", function () {
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
        deleteApplicationTableRows();
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
