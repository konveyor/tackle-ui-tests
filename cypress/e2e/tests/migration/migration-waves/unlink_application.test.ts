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
import {
    JiraIssue,
    JiraIssueType,
} from "../../../models/administration/jira-connection/jira-api.interface";
import { Application } from "../../../models/migration/applicationinventory/application";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import {
    button,
    CredentialType,
    deleteAction,
    JiraIssueTypes,
    JiraType,
    SEC,
    tdTag,
    trTag,
} from "../../../types/constants";
import Chainable = Cypress.Chainable;

const now = new Date();
now.setDate(now.getDate() + 1);

const end = new Date(now.getTime());
end.setFullYear(end.getFullYear() + 1);

let jiraCloudCredentials: JiraCredentials;
let jiraCloudInstance: Jira;
const applications: Application[] = [];
let migrationWave: MigrationWave;
let projectName = "";

describe(["@tier3"], "Unlink application from exported migration waves", function () {
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

        applications.push(...createMultipleApplications(2));
        migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            null,
            null,
            applications
        );
        migrationWave.create();
    });

    // Automates Polarion TC 414
    it("Export to Jira Cloud and unlink applications from wave", function () {
        exportWave().then(() => {
            migrationWave.clickWaveStatus();
            migrationWave.unlinkApplications(applications);
            Jira.openList();
            cy.get(tdTag)
                .contains(jiraCloudInstance.name)
                .closest(trTag)
                .within(() => {
                    cy.contains(button, deleteAction).should(
                        "not.have.class",
                        "pf-m-aria-disabled"
                    );
                });
        });
    });

    // Automates Polarion TC 415
    it("Export to Jira Cloud and unlink applications from App Inventory", function () {
        exportWave().then(() => {
            Application.open(true);
            applications.forEach((app) => app.unlinkJiraTicket());
            Jira.openList();
            cy.get(tdTag)
                .contains(jiraCloudInstance.name)
                .closest(trTag)
                .within(() => {
                    cy.contains(button, deleteAction).should(
                        "not.have.class",
                        "pf-m-aria-disabled"
                    );
                });
        });
    });

    afterEach("Clear state", function () {
        Application.open(true);
    });

    after("Clear test data", function () {
        jiraCloudInstance.getIssues(projectName).then((issues: JiraIssue[]) => {
            jiraCloudInstance.deleteIssues(issues.map((issue) => issue.id));
        });
        migrationWave.delete();
        applications.forEach((app) => app.delete());
        jiraCloudInstance.delete();
        jiraCloudCredentials.delete();
    });
});

const exportWave = (): Chainable<JiraIssueType> => {
    return jiraCloudInstance
        .getProject(Cypress.env("jira_atlassian_cloud_project"))
        .then((project) => {
            expect(!!project).to.eq(true);

            if (Array.isArray(project)) {
                project = project[0];
            }

            projectName = project.name;
            expect(Cypress.env("jira_atlassian_cloud_project")).to.eq(projectName);

            return jiraCloudInstance.getIssueType(JiraIssueTypes.task);
        })
        .then((issue) => {
            expect(!!issue).to.eq(true);

            migrationWave.exportToIssueManager(
                JiraType.cloud,
                jiraCloudInstance.name,
                projectName,
                issue.untranslatedName
            );
            cy.wait(30 * SEC); // Enough time to create both tasks and for them to be available in the Jira API
        });
};
