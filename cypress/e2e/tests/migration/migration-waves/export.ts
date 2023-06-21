import {
    checkSuccessAlert,
    createMultipleApplications,
    deleteAllStakeholderGroups,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    login,
} from "../../../../utils/utils";
import { CredentialType, JiraType, SEC } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { successAlertMessage } from "../../../views/common.view";
import {
    getSpecialMigrationWavesTableSelector,
    MigrationWavesSpecialColumns,
    MigrationWaveView,
} from "../../../views/migration-wave.view";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { Jira } from "../../../models/administration/jira/jira";
import { CredentialsBasicJira } from "../../../models/administration/credentials/credentialsBasicJira";

const now = new Date();
now.setDate(now.getDate() + 1);

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

let applications: Assessment[];
let migrationWave: MigrationWave;
let jiraInstance: Jira;

// Automates Polarion TC 340
describe(["@tier3"], "Export Migration Wave to Issue Manager", () => {
    before("Create test data", () => {
        login();
        applications = createMultipleApplications(2);

        migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            null,
            null,
            applications
        );
        migrationWave.create();

        const jiraCredentials = new CredentialsBasicJira(
            data.getRandomCredentialsData(CredentialType.jiraBasic)
        );
        jiraCredentials.create();

        jiraInstance = new Jira({
            name: data.getRandomWord(5),
            url: Cypress.env("jira_url"),
            credential: jiraCredentials,
            type: JiraType.cloud,
        });
        jiraInstance.create();
    });

    it("Export to Jira", function () {
        migrationWave.exportToIssueManager(JiraType.cloud, "asdasd", "Test", "Task");
    });

    after("Clear test data", function () {
        //deleteAllStakeholders();
        //deleteAllStakeholderGroups();
        //deleteApplicationTableRows();
    });
});
