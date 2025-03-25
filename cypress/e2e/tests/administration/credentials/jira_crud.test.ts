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

import { getJiraCredentialData } from "../../../../utils/data_utils";
import { login } from "../../../../utils/utils";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { CredentialType } from "../../../types/constants";
import { CredentialsData } from "../../../types/types";

// Commented Token tests as now they can't be run because of missing environment.
describe(["@tier2"], "Validation of jira credentials", () => {
    const toBeCanceled = true;
    let validJiraBasicCredentials: CredentialsData;
    let randomJiraBasicCredentials: CredentialsData;
    let jiraBasicCredentials: JiraCredentials;
    const useTestingAccount = true;

    before("Login", function () {
        login();
        cy.visit("/");

        randomJiraBasicCredentials = getJiraCredentialData(
            CredentialType.jiraBasic,
            !useTestingAccount
        );

        validJiraBasicCredentials = getJiraCredentialData(
            CredentialType.jiraBasic,
            useTestingAccount
        );

        jiraBasicCredentials = new JiraCredentials(randomJiraBasicCredentials);
    });

    it("Creating Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.create(toBeCanceled);
    });

    it("Creating Jira credentials", () => {
        jiraBasicCredentials.create();
        jiraBasicCredentials.validateValues();
    });

    it("Editing Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials, toBeCanceled);
        jiraBasicCredentials.validateValues();
    });

    it("Editing Jira credentials", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials);
        jiraBasicCredentials.validateValues();
    });

    it("Delete Jira credentials and cancel deletion", () => {
        jiraBasicCredentials.delete(toBeCanceled);
    });

    after("Delete Jira credentials", () => {
        jiraBasicCredentials.delete();
    });
});
