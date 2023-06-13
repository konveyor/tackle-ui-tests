import {
    checkSuccessAlert,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteAllStakeholderGroups,
    deleteAllStakeholders,
    login,
} from "../../../../utils/utils";
import { SEC } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../models/migration/controls/stakeholdergroups";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { successAlertMessage } from "../../../views/common.view";

let stakeHolders: Stakeholders[];
let stakeHolderGroups: Stakeholdergroups[];

// Automates Polarion TC 332
describe(["@tier1"], "Migration Waves CRUD operations", () => {
    before("Create test data", () => {
        login();
        stakeHolders = createMultipleStakeholders(2);
        stakeHolderGroups = createMultipleStakeholderGroups(2);
    });

    beforeEach("Login", function () {
        cy.intercept("GET", "/hub/migrationwaves*").as("getWave");
        cy.intercept("POST", "/hub/migrationwaves*").as("postWave");
        cy.intercept("PUT", "/hub/migrationwaves*/*").as("putWave");
        cy.intercept("DELETE", "/hub/migrationwaves*/*").as("deleteWave");
    });

    it("Fails due to MTA-753 | Migration Wave CRUD", function () {
        const now = new Date();
        now.setDate(now.getDate() + 1);

        const end = new Date(now.getTime());
        end.setFullYear(end.getFullYear() + 1);

        const migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            stakeHolders,
            stakeHolderGroups
        );

        migrationWave.create();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Migration wave ${migrationWave.name} was successfully created.`,
            true
        );
        cy.wait("@postWave");
        cy.get("td", { timeout: 12 * SEC }).should("contain", migrationWave.name);

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

        migrationWave.delete();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Migration wave ${migrationWave.name} was successfully deleted.`,
            true
        );
        cy.wait("@deleteWave");
        cy.get("td", { timeout: 12 * SEC }).should("not.contain", newName);
    });

    after("Clear test data", function () {
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
    });
});
