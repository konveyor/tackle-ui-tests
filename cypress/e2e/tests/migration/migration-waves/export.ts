import { createMultipleApplications, login } from "../../../../utils/utils";
import { CredentialType, JiraType, SEC } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { CredentialsBasicJira } from "../../../models/administration/credentials/credentialsBasicJira";
import { JiraIssue } from "../../../models/administration/jira-connection/jira-api.interface";

const now = new Date();
now.setDate(now.getDate() + 1);

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

let applications: Assessment[];
let migrationWave: MigrationWave;
let jiraInstance: Jira;
let jiraCredentials: CredentialsBasicJira;

// Automates Polarion TC 340
describe(["@tier1"], "Export Migration Wave to Issue Manager", function () {
    before("Create test data", function () {
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

        jiraCredentials = new CredentialsBasicJira(
            data.getRandomCredentialsData(CredentialType.jiraBasic, null, true)
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

    it("Export issues to Jira", function () {
        let projectName = "";

        jiraInstance
            .getProject()
            .then((project) => {
                expect(!!project).to.eq(true);

                projectName = project.name;

                return jiraInstance.getIssueType("Task");
            })
            .then((task) => {
                expect(!!task).to.eq(true);

                migrationWave.exportToIssueManager(
                    JiraType.cloud,
                    jiraInstance.name,
                    projectName,
                    task.untranslatedName
                );
            })
            .then((_) => {
                cy.wait(35 * SEC); // Enough time to create both tasks and for them to be available in the Jira API
                return jiraInstance.getIssues(projectName);
            })
            .then((issues: JiraIssue[]) => {
                expect(
                    migrationWave.applications.every((app) =>
                        issues.find((issue) => issue.fields.summary.includes(app.name))
                    )
                ).to.eq(true);

                jiraInstance.deleteIssues(issues.map((issue) => issue.id));
            });
    });

    after("Clear test data", function () {
        migrationWave.delete();
        // jiraInstance.delete(); This method is not working right now
        // jiraCredentials.delete();
        applications.forEach((app) => app.delete());
    });
});
