import { createMultipleApplications, login } from "../../../../utils/utils";
import { CredentialType, JiraIssueTypes, JiraType, SEC } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraIssue } from "../../../models/administration/jira-connection/jira-api.interface";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";

const now = new Date();
now.setDate(now.getDate() + 1);

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

let jiraCloudCredentials: JiraCredentials;
let jiraCloudInstance: Jira;
const applications: Assessment[] = [];
const wavesMap = {};
let projectName = "";

// Automates Polarion TC 340, 359, 360 and 361 for Jira Cloud
/**
 * This test suite contains tests that are co-dependent, so they won't pass if they're executed separately
 */
describe.only(["@tier1"], "Export Migration Wave to Issue Manager", function () {
    before("Create test data", function () {
        login();

        jiraCloudCredentials = new JiraCredentials(
            data.getJiraCredentialData(CredentialType.jiraBasic, true)
        );
        jiraCloudCredentials.create();

        jiraCloudInstance = new Jira(data.getJiraConnectionData(jiraCloudCredentials, false, true));
        jiraCloudInstance.create();
    });

    Object.values(JiraIssueTypes).forEach((issueType) => {
        it(`Create wave to export as ${issueType}`, function () {
            const apps = createMultipleApplications(2);
            applications.push(...apps);

            const migrationWave = new MigrationWave(
                data.getRandomWord(8),
                now,
                end,
                null,
                null,
                apps
            );
            migrationWave.create();
            wavesMap[issueType] = migrationWave;
        });
    });

    Object.values(JiraIssueTypes).forEach((issueType) => {
        it(`Export wave as ${issueType} to Jira`, function () {
            jiraCloudInstance
                .getProject()
                .then((project) => {
                    expect(!!project).to.eq(true);

                    projectName = project.name;

                    return jiraCloudInstance.getIssueType(issueType);
                })
                .then((issue) => {
                    expect(!!issue).to.eq(true);

                    wavesMap[issueType].exportToIssueManager(
                        JiraType.cloud,
                        jiraCloudInstance.name,
                        projectName,
                        issue.untranslatedName
                    );
                });
        });
    });

    Object.values(JiraIssueTypes).forEach((issueType) => {
        const markBug = issueType === "Subtask" ? "BUG MTA-870 | " : "";
        it(`${markBug} Assert exports for ${issueType}`, function () {
            cy.wait(30 * SEC); // Enough time to create both tasks and for them to be available in the Jira API
            jiraCloudInstance.getIssues(projectName).then((issues: JiraIssue[]) => {
                const waveIssues = issues.filter((issue) => {
                    return (
                        (issue.fields.summary.includes(wavesMap[issueType].applications[0].name) ||
                            issue.fields.summary.includes(
                                wavesMap[issueType].applications[1].name
                            )) &&
                        issue.fields.issuetype.name.toUpperCase() ===
                            (issueType as string).toUpperCase()
                    );
                });

                jiraCloudInstance.deleteIssues(waveIssues.map((issue) => issue.id));

                expect(waveIssues).to.have.length(2);
            });
        });
    });
    after("Clear test data", function () {
        Object.values(wavesMap).forEach((wave: MigrationWave) => wave.delete());
        applications.forEach((app) => app.delete());
        jiraCloudInstance.delete();
        jiraCloudCredentials.delete();
    });
});
