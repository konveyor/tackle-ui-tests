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
import { createMultipleApplications, login } from "../../../../utils/utils";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraIssue } from "../../../models/administration/jira-connection/jira-api.interface";
import { Application } from "../../../models/migration/applicationinventory/application";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import { CredentialType, JiraIssueTypes, JiraType, SEC } from "../../../types/constants";

const now = new Date();
now.setDate(now.getDate() + 1);

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

let jiraCloudCredentials: JiraCredentials;
let jiraCloudInstance: Jira;
const applications: Application[] = [];
const wavesMap = {};
const appsMap = {};
let projectName = "";

// Automates Polarion TC 340, 359, 360 and 361 for Jira Cloud
/**
 * This test suite contains tests that are co-dependent, so they won't pass if they're executed separately
 * @see export_to_jira_datacenter.test.ts for Jira Datacenter tests
 * This suite is almost identical to jira_datacenter but putting both tests in the same suite would make the code harder to read
 */
describe(["@tier2"], "Export Migration Wave to Jira Cloud", function () {
    before("Create test data", function () {
        if (
            !Cypress.env("jira_atlassian_cloud_project") ||
            !Cypress.env("jira_atlassian_cloud_email") ||
            !Cypress.env("jira_atlassian_cloud_token") ||
            !Cypress.env("jira_atlassian_cloud_url")
        ) {
            expect(
                true,
                `
                    Some configurations required for this test are missing, please ensure that you've properly configured the following parameters in the cypress.config.ts file:\n
                    jira_atlassian_cloud_project\njira_atlassian_cloud_email\njira_atlassian_cloud_token\njira_atlassian_cloud_url
                `
            ).to.eq(false);
        }
        login();
        cy.visit("/");
        jiraCloudCredentials = new JiraCredentials(
            data.getJiraCredentialData(CredentialType.jiraBasic, true)
        );
        jiraCloudCredentials.create();

        jiraCloudInstance = new Jira(
            data.getJiraConnectionData(jiraCloudCredentials, JiraType.cloud, false, true)
        );
        jiraCloudInstance.create();
    });

    Object.values(JiraIssueTypes).forEach((issueType) => {
        it(`Create wave to export as ${issueType}`, function () {
            const apps = createMultipleApplications(2);
            applications.push(...apps);
            appsMap[issueType] = apps;

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
                .getProject(Cypress.env("jira_atlassian_cloud_project"))
                .then((project) => {
                    expect(!!project).to.eq(true);

                    if (Array.isArray(project)) {
                        project = project[0];
                    }

                    projectName = project.name;
                    expect(Cypress.env("jira_atlassian_cloud_project")).to.eq(projectName);

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
        it(`Assert exports for ${issueType}`, function () {
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

                Application.open();

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
