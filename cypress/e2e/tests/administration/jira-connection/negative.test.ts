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
import { CredentialType } from "../../../types/constants";
import { JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";

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
    });

    it("Creating Jira connection with incorrect credentials", () => {
        jiraCloudConnectionIncorrect.create();
        jiraCloudConnectionIncorrect.validateState(expectedToFail);
    });

    it("Removing Jira connection in use by wave", () => {
        jiraCloudConnection.create();
        jiraCloudConnection.validateState(!expectedToFail);
    });

    after("Delete Jira connection and Jira credentials", () => {
        jiraCloudConnectionIncorrect.delete();
        jiraBasicCredentialInvalid.delete();
    });
});
