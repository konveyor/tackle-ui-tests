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

import { login } from "../../../../utils/utils";
import { getJiraConnectionData, getJiraCredentialData } from "../../../../utils/data_utils";
import {
    button,
    CredentialType,
    deleteAction,
    JiraType,
    SEC,
    tdTag,
    trTag,
} from "../../../types/constants";
import { JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { Credentials } from "../../../models/administration/credentials/credentials";

describe(["@tier2"], "Jira connection negative tests", () => {
    const useTestingAccount = true;
    const isSecure = false;
    let jiraBasicCredential: JiraCredentials;
    let jiraStageCredential: JiraCredentials;
    let jiraCloudConnectionData: JiraConnectionData;
    let jiraStageConnectionData: JiraConnectionData;
    let jiraCloudConnection: Jira;
    let jiraStageConnection: Jira;

    before("Login and prepare prerequisites", function () {
        login();
        jiraBasicCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, useTestingAccount)
        );
        jiraBasicCredential.create();

        jiraStageCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraToken, useTestingAccount)
        );
        jiraStageCredential.create();

        // Defining Jira Cloud connection data with correct credentials
        jiraCloudConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.cloud,
            isSecure,
            useTestingAccount
        );

        jiraCloudConnection = new Jira(jiraCloudConnectionData);
        jiraCloudConnection.create();

        // Defining Jira Stage connection data with correct credentials
        jiraStageConnectionData = getJiraConnectionData(
            jiraStageCredential,
            JiraType.server,
            isSecure,
            useTestingAccount
        );

        jiraStageConnection = new Jira(jiraStageConnectionData);
        jiraStageConnection.create();
    });

    it("Trying to remove Basic credential used by Jira connection", () => {
        Credentials.openList();
        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(jiraBasicCredential.name, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                cy.contains(button, deleteAction).should("have.attr", "aria-disabled", "true");
            });
    });

    it("Trying to remove Token credential used by Jira connection", () => {
        Credentials.openList();
        cy.get(tdTag, { timeout: 120 * SEC })
            .contains(jiraStageCredential.name, { timeout: 120 * SEC })
            .closest(trTag)
            .within(() => {
                cy.contains(button, deleteAction).should("have.attr", "aria-disabled", "true");
            });
    });

    after("Clean up data", () => {
        jiraCloudConnection.delete();
        jiraStageConnection.delete();
        jiraStageCredential.delete();
        jiraBasicCredential.delete();
    });
});
