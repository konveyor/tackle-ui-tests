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
    createMultipleApplications,
    doesExistText,
    exists,
    login,
    performRowAction,
    validateTextPresence,
} from "../../../../utils/utils";
import { getJiraConnectionData, getJiraCredentialData } from "../../../../utils/data_utils";
import { CredentialType, deleteAction, JiraIssueTypes, JiraType } from "../../../types/constants";
import { JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { MigrationWave } from "../../../models/migration/migration-waves/migration-wave";
import * as data from "../../../../utils/data_utils";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";

describe(["@tier2"], "Jira connection negative tests", () => {
    const toBeCanceled = true;
    const expectedToFail = true;
    const useTestingAccount = true;
    const isSecure = false;
    let jiraBasicCredential: JiraCredentials;
    let jiraBasicCredentialInvalid: JiraCredentials;
    let jiraCloudConnectionData: JiraConnectionData;
    let jiraCloudConnectionDataIncorrect: JiraConnectionData;
    let jiraCloudConnection: Jira;
    let jiraCloudConnectionIncorrect: Jira;
    let applicationList: Array<Assessment> = [];
    const wavesMap = {};
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const end = new Date(now.getTime());
    end.setFullYear(end.getFullYear() + 1);

    before("Login and create required credentials", function () {
        // Perform login
        login();
        // Defining and creating credentials to be used in further tests
        jiraBasicCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, useTestingAccount)
        );

        jiraBasicCredential.create();

        // Defining Jira connection data with correct credentials
        jiraCloudConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            isSecure,
            useTestingAccount
        );

        jiraCloudConnection = new Jira(jiraCloudConnectionData);

        // Defining and creating dummy credentials to be used further in tests
        jiraBasicCredentialInvalid = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, !useTestingAccount)
        );

        jiraBasicCredentialInvalid.create();

        // Defining Jira connection data with incorrect credentials
        jiraCloudConnectionDataIncorrect = getJiraConnectionData(
            jiraBasicCredentialInvalid,
            isSecure,
            useTestingAccount
        );

        jiraCloudConnectionIncorrect = new Jira(jiraCloudConnectionDataIncorrect);

        applicationList = createMultipleApplications(2);
    });

    it.skip("Creating Jira connection with incorrect credentials", () => {
        jiraCloudConnectionIncorrect.create();
        jiraCloudConnectionIncorrect.validateState(expectedToFail);
    });

    it("Removing Jira connection in use by wave", () => {
        const issueType = JiraIssueTypes.task;
        let projectName = "";
        jiraCloudConnection.create();
        jiraCloudConnection.validateState(!expectedToFail);

        // Defining and creating new migration wave
        const migrationWave = new MigrationWave(
            data.getRandomWord(8),
            now,
            end,
            null,
            null,
            applicationList
        );
        migrationWave.create();

        jiraCloudConnection
            // Getting all projects on Jira side
            .getAllProjects()
            .then((project) => {
                // Checking that project is not a NULL or undefined
                expect(!!project[0]).to.eq(true);
                projectName = project[0].name;
                return jiraCloudConnection.getIssueType(issueType);
            })
            .then((issue) => {
                // Checking that Jira issue type is not a NULL or undefined
                expect(!!issue).to.eq(true);

                // Exporting wave to Jira
                migrationWave.exportToIssueManager(
                    JiraType.cloud,
                    jiraCloudConnection.name,
                    projectName,
                    issue.untranslatedName
                );
            });
        // jiraCloudConnection.delete();
        Jira.openList();
        performRowAction(jiraCloudConnection.name, deleteAction);
        validateTextPresence(
            "h4.pf-c-alert__title",
            "Danger alert:The instance contains issues associated with application and cannot be deleted"
        );
        exists(jiraCloudConnection.name, "table[aria-label='Jira trackers table']");
    });

    // after("Delete Jira connection and Jira credentials", () => {
    //     jiraCloudConnectionIncorrect.delete();
    //     jiraBasicCredentialInvalid.delete();
    // });
});
