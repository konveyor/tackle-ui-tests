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

import {
    clickByText,
    createMultipleApplications,
    deleteByList,
    exists,
    login,
    performRowAction,
    validateTextPresence,
} from "../../../../utils/utils";
import { getJiraConnectionData, getJiraCredentialData } from "../../../../utils/data_utils";
import {
    button,
    cantDeleteJiraAlert,
    CredentialType,
    deleteAction,
    JiraIssueTypes,
    JiraType,
    SEC,
} from "../../../types/constants";
import { JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import * as data from "../../../../utils/data_utils";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { jiraAlert, jiraTable } from "../../../views/jira.view";

describe(["@tier2"], "Jira connection negative tests", () => {
    const expectedToFail = true;
    const useTestingAccount = true;
    const isSecure = false;
    let jiraBasicCredential: JiraCredentials;
    let jiraBasicCredentialInvalid: JiraCredentials;
    let jiraBearerCredentialInvalid: JiraCredentials;
    let jiraStageConnectionDataIncorrect: JiraConnectionData;
    let jiraCloudConnectionData: JiraConnectionData;
    let jiraCloudConnectionDataIncorrect: JiraConnectionData;
    let jiraCloudConnection: Jira;
    let jiraCloudConnectionIncorrect: Jira;
    let jiraStageConnectionIncorrect: Jira;
    let applicationList: Array<Assessment> = [];
    const targetProject = Cypress.env("jira_atlassian_cloud_project");
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const end = new Date(now.getTime());
    end.setFullYear(end.getFullYear() + 1);
    let migrationWave: MigrationWave;

    before("Login and create required credentials", function () {
        login();
        jiraBasicCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, useTestingAccount)
        );

        jiraBasicCredential.create();

        // Defining Jira Cloud connection data with correct credentials
        jiraCloudConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.cloud,
            isSecure,
            useTestingAccount
        );

        jiraCloudConnection = new Jira(jiraCloudConnectionData);

        // Defining and creating dummy credentials to be used further in tests
        jiraBasicCredentialInvalid = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, !useTestingAccount)
        );

        jiraBasicCredentialInvalid.create();

        jiraBearerCredentialInvalid = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraToken, !useTestingAccount)
        );

        // Defining Jira Cloud connection data with incorrect credentials
        jiraCloudConnectionDataIncorrect = getJiraConnectionData(
            jiraBasicCredentialInvalid,
            JiraType.cloud,
            isSecure,
            useTestingAccount
        );

        jiraCloudConnectionIncorrect = new Jira(jiraCloudConnectionDataIncorrect);

        // Defining Jira Stage connection data with incorrect credentials
        jiraStageConnectionDataIncorrect = getJiraConnectionData(
            jiraBearerCredentialInvalid,
            JiraType.server,
            isSecure,
            useTestingAccount
        );

        jiraStageConnectionIncorrect = new Jira(jiraStageConnectionDataIncorrect);

        applicationList = createMultipleApplications(2);
    });

    beforeEach("Interceptors", function () {
        cy.intercept("DELETE", "/hub/migrationwaves*/*").as("deleteWave");
    });

    it("Validating error when Jira Cloud Instance is not connected", () => {
        /**
         Implements MTA-362 - Add JIRA instance with invalid credentials
         Automates https://issues.redhat.com/browse/MTA-991
        */
        jiraCloudConnectionIncorrect.create();
        jiraCloudConnectionIncorrect.validateState(expectedToFail);
        cy.wait(30 * SEC);
        clickByText(button, "Not connected");
        cy.get("#code-content").then(($code) => {
            expect($code.text()).to.contain("401 Unauthorized");
            expect($code.text().toLowerCase()).not.to.contain("html");
            expect($code.text()).not.to.contain("403");
        });
    });

    it("Bug MTA-991 | Validating error when Jira Stage Instance is not connected", () => {
        /**
         Implements MTA-362 - Add JIRA instance with invalid credentials
         Automates https://issues.redhat.com/browse/MTA-991
         */
        jiraStageConnectionIncorrect.create();
        jiraStageConnectionIncorrect.validateState(expectedToFail);
        cy.wait(30 * SEC);
        clickByText(button, "Not connected");
        cy.get("#code-content").then(($code) => {
            expect($code.text()).to.contain("401 Unauthorized");
            expect($code.text().toLowerCase()).not.to.contain("html");
            expect($code.text()).not.to.contain("403");
        });
    });

    it("Bug MTA-1014 | Trying to remove Jira connection used by wave", () => {
        /**
         Implements MTA-363 - Delete Jira Instance in use
         */
        const issueType = JiraIssueTypes.task;
        let projectName = "";
        jiraCloudConnection.create();
        jiraCloudConnection.validateState(!expectedToFail);

        // Defining and creating new migration wave
        migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            null,
            null,
            applicationList
        );
        migrationWave.create();

        jiraCloudConnection
            .getProject(targetProject)
            .then((project) => {
                projectName = project.name;
                return jiraCloudConnection.getIssueType(issueType);
            })
            .then((issue) => {
                expect(!!issue).to.eq(true);
                migrationWave.exportToIssueManager(
                    JiraType.cloud,
                    jiraCloudConnection.name,
                    projectName,
                    issue.untranslatedName
                );
            });
        Jira.openList();
        performRowAction(jiraCloudConnection.name, deleteAction);
        validateTextPresence(jiraAlert, cantDeleteJiraAlert);
        exists(jiraCloudConnection.name, jiraTable);
    });

    after("Clean up data", () => {
        migrationWave.delete();
        cy.wait("@deleteWave");
        jiraCloudConnectionIncorrect.delete();
        jiraCloudConnection.delete();
        jiraBasicCredentialInvalid.delete();
        jiraBasicCredential.delete();
        deleteByList(applicationList);
    });
});
