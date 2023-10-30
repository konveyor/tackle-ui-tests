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
    cancelForm,
    click,
    doesExistText,
    inputText,
    login,
    validateTooLongInput,
    validateTooShortInput,
} from "../../../../utils/utils";
import { getJiraConnectionData, getJiraCredentialData } from "../../../../utils/data_utils";
import { CredentialType, JiraType } from "../../../types/constants";
import { CredentialsData, JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { createJiraButton, instanceName, instanceUrl } from "../../../views/jira.view";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";

let validJiraBasicCredentials: CredentialsData;
let jiraBasicCredential: JiraCredentials;
let jiraServerConnectionData: JiraConnectionData;
let jiraServerConnection: Jira;
const useTestingAccount = true;
const isInsecure = true;

describe(["@tier3"], "Field validations for Jira Server connection instance", () => {
    before("Login", function () {
        // Perform login
        login();
        // Defining and creating credentials to be used in test
        validJiraBasicCredentials = getJiraCredentialData(
            CredentialType.jiraBasic,
            useTestingAccount
        );
        jiraBasicCredential = new JiraCredentials(validJiraBasicCredentials);

        jiraBasicCredential.create();

        // Defining correct data to create new Jira connection
        jiraServerConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.server,
            !isInsecure,
            useTestingAccount
        );

        jiraServerConnection = new Jira(jiraServerConnectionData);
        jiraServerConnection.create();
    });

    it("Testing fields validation", () => {
        Jira.openList();
        click(createJiraButton);
        // Validating too short and too long cases for name
        validateTooShortInput(instanceName);
        validateTooLongInput(instanceName);
        // Validating URL format and too long link
        inputText(instanceUrl, "https://");
        doesExistText(
            "Enter a valid URL. Note that a cloud instance or most public instances will require the use of HTTPS.",
            true
        );
        validateTooLongInput(instanceUrl, 251, null);
        // Cancelling form after checks are done
        cancelForm();
    });

    it("Testing duplicate error message", () => {
        Jira.openList();
        click(createJiraButton);
        inputText(instanceName, jiraServerConnection.name);
        doesExistText("An identity with this name already exists. Use a different name.", true);
        cancelForm();
    });

    after("Delete Jira connection and Jira credentials", () => {
        jiraServerConnection.delete();
        jiraBasicCredential.delete();
    });
});
