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

import * as data from "../../../utils/data_utils";
import { createMultipleApplications, login } from "../../../utils/utils";
import { JiraCredentials } from "../../models/administration/credentials/JiraCredentials";
import { Jira } from "../../models/administration/jira-connection/jira";
import { JiraIssue } from "../../models/administration/jira-connection/jira-api.interface";
import { Application } from "../../models/migration/applicationinventory/application";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
import { MigrationWave } from "../../models/migration/migration-waves/migration-wave";
import { CredentialType, JiraType, SEC } from "../../types/constants";

const now = new Date();
now.setDate(now.getDate() + 1);

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

let applications: Application[];
let migrationWave: MigrationWave;
let jiraInstance: Jira;
let jiraCredentials: JiraCredentials;
const metrics = new Metrics();
const metricName = "konveyor_issues_exported_total";
let counter: number;

// Automates Polarion TC 337
describe(["@tier2"], "Custom Metrics - Count the total number of issues exported", function () {
    before("Create test data", function () {
        login();
        cy.visit("/");
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

        jiraCredentials = new JiraCredentials(
            data.getRandomCredentialsData(CredentialType.jiraBasic, null, true)
        );
        jiraCredentials.create();

        jiraInstance = new Jira({
            name: data.getRandomWord(5),
            url: Cypress.env("jira_atlassian_cloud_url"),
            credential: jiraCredentials,
            type: JiraType.cloud,
        });
        jiraInstance.create();

        metrics.getValue(metricName).then((counterValue) => {
            counter = counterValue;
        });
    });

    it("Export issues to Jira and validate the metrics counter", function () {
        let projectName = "";

        jiraInstance
            .getProject()
            .then((project) => {
                projectName = project.name;

                return jiraInstance.getIssueType("Task");
            })
            .then((task) => {
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
                counter += 2;

                // Validate the issues exported count change
                metrics.validateMetric(metricName, counter);

                migrationWave.delete();
                // Validate the issues exported doesn't change count
                metrics.validateMetric(metricName, counter);

                // Delete the jira issues attached to instance
                jiraInstance.deleteIssues(issues.map((issue) => issue.id));
            });
    });

    after("Clear test data", function () {
        applications.forEach((app) => app.delete());
        jiraInstance.delete();
        jiraCredentials.delete();
    });
});
