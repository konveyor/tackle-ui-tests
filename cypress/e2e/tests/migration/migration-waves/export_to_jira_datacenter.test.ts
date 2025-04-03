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
import { createMultipleApplications, deleteByList, login } from "../../../../utils/utils";
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

let jiraCredentials: JiraCredentials;
let jiraInstance: Jira;
const applications: Application[] = [];
let wave: MigrationWave;
let projectName = "";

// Automates Polarion TC 340, 359, 360 and 361 for Jira Datacenter
/**
 * This test suite contains tests that are co-dependent, so they won't pass if they're executed separately
 * @see export_to_jira_cloud.test.ts for Jira Cloud tests
 * This suite is almost identical to jira_cloud but putting both tests in the same suite would make the code harder to read
 * The only difference is that this test doesn't remove/archive the issues created since the token doesn't have enough permissions
 */
describe(["@tier2"], "Export Migration Wave to Jira Datacenter", function () {
    before("Create test data", function () {
        if (
            !Cypress.env("jira_stage_datacenter_project_id") ||
            !Cypress.env("jira_stage_bearer_token") ||
            !Cypress.env("jira_stage_datacenter_url")
        ) {
            expect(
                true,
                `
                    Some configurations required for this test are missing, please ensure that you've properly configured the following parameters in the cypress.config.ts file:\n
                    jira_stage_datacenter_project_id\njira_stage_bearer_token\njira_stage_datacenter_url
                `
            ).to.eq(false);
        }
        login();
        cy.visit("/");
        jiraCredentials = new JiraCredentials(
            data.getJiraCredentialData(CredentialType.jiraToken, true)
        );
        jiraCredentials.create();

        jiraInstance = new Jira(
            data.getJiraConnectionData(jiraCredentials, JiraType.server, false, true)
        );
        jiraInstance.create();
    });

    Object.values(JiraIssueTypes).forEach((issueType) => {
        it(`Create wave to export as ${issueType}`, function () {
            const apps = createMultipleApplications(2);
            applications.push(...apps);

            wave = new MigrationWave(data.getRandomWord(8), now, end, null, null, apps);
            wave.create();
        });

        it(`Export wave as ${issueType} to Jira`, function () {
            jiraInstance
                .getProjectById(Cypress.env("jira_stage_datacenter_project_id"))
                .then((project) => {
                    expect(!!project).to.eq(true);

                    projectName = project.name;

                    return jiraInstance.getIssueType(issueType);
                })
                .then((issue) => {
                    expect(!!issue).to.eq(true);

                    MigrationWave.open(true);
                    wave.exportToIssueManager(
                        JiraType.server,
                        jiraInstance.name,
                        projectName,
                        issue.name
                    );
                });
        });

        it(`Assert exports for ${issueType}`, function () {
            cy.wait(40 * SEC); // Enough time to create both tasks and for them to be available in the Jira API
            jiraInstance.getIssues(projectName).then((issues: JiraIssue[]) => {
                const waveIssues = issues.filter((issue) => {
                    return (
                        (issue.fields.summary.includes(wave.applications[0].name.trim()) ||
                            issue.fields.summary.includes(wave.applications[1].name.trim())) &&
                        issue.fields.issuetype.name.toUpperCase() ===
                            (issueType as string).toUpperCase()
                    );
                });

                expect(waveIssues).to.have.length(2);
                wave.delete();
            });
        });
    });

    after("Clear test data", function () {
        MigrationWave.open(true);
        deleteByList(applications);
        jiraInstance.delete();
        jiraCredentials.delete();
    });
});
