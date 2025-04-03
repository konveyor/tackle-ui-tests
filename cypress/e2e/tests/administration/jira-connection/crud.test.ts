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

import { getJiraConnectionData, getJiraCredentialData } from "../../../../utils/data_utils";
import { login } from "../../../../utils/utils";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { CredentialType, JiraType } from "../../../types/constants";
import { JiraConnectionData } from "../../../types/types";

describe(["@tier2"], "CRUD operations for Jira Cloud instance", () => {
    const toBeCanceled = true;
    const expectedToFail = true;
    const useTestingAccount = true;
    const isSecure = false;
    const isStage = true;
    let jiraBasicCredential: JiraCredentials;
    let jiraBasicStageCredential: JiraCredentials;
    let jiraCloudConnectionData: JiraConnectionData;
    let jiraStageConnectionData: JiraConnectionData;
    let jiraCloudConnectionDataIncorrect: JiraConnectionData;
    let jiraStageConnectionDataIncorrect: JiraConnectionData;
    let jiraCloudConnection: Jira;
    let jiraStageConnection: Jira;

    before("Login", function () {
        login();
        cy.visit("/");
        // Defining and creating credentials to be used in test
        jiraBasicCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, useTestingAccount)
        );

        jiraBasicStageCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraToken, useTestingAccount, isStage)
        );

        jiraBasicCredential.create();
        jiraBasicStageCredential.create();

        // Defining correct data to create new Jira Cloud connection
        jiraCloudConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.cloud,
            isSecure,
            useTestingAccount
        );

        // Defining correct data to create new Jira Stage connection
        jiraStageConnectionData = getJiraConnectionData(
            jiraBasicStageCredential,
            JiraType.server,
            isSecure,
            useTestingAccount
        );

        // Defining dummy data to edit Jira Cloud connection
        jiraCloudConnectionDataIncorrect = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.cloud,
            isSecure,
            !useTestingAccount
        );

        // Defining dummy data to edit Jira Stage connection
        jiraStageConnectionDataIncorrect = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.server,
            isSecure,
            !useTestingAccount
        );

        jiraCloudConnection = new Jira(jiraCloudConnectionData);
        jiraStageConnection = new Jira(jiraStageConnectionData);
    });

    it("Creating Jira Cloud connection and cancelling without saving", () => {
        jiraCloudConnection.create(toBeCanceled);
    });

    it("Creating Jira Cloud connection", () => {
        jiraCloudConnection.create();
        jiraCloudConnection.validateState(!expectedToFail);
    });

    it("Editing Jira Cloud connection and cancelling without saving", () => {
        jiraCloudConnection.edit(jiraCloudConnectionDataIncorrect, toBeCanceled);
    });

    it("Editing Jira Cloud connection with incorrect data, then configuring back with correct", () => {
        jiraCloudConnection.edit(jiraCloudConnectionDataIncorrect, !toBeCanceled);
        jiraCloudConnection.validateState(expectedToFail);
        jiraCloudConnection.edit(jiraCloudConnectionData);
    });

    it("Delete Jira Cloud connection and cancel deletion", () => {
        jiraCloudConnection.delete(toBeCanceled);
    });

    it("Creating Jira stage connection and cancelling without saving", () => {
        jiraStageConnection.create(toBeCanceled);
    });

    it("Creating Jira Stage connection", () => {
        jiraStageConnection.create();
        jiraStageConnection.validateState(!expectedToFail);
    });

    it("Editing Jira Stage connection and cancelling without saving", () => {
        jiraStageConnection.edit(jiraStageConnectionDataIncorrect, toBeCanceled);
    });

    it("Editing Jira Stage connection with incorrect data, then configuring back with correct", () => {
        jiraStageConnection.edit(jiraStageConnectionDataIncorrect, !toBeCanceled);
        jiraStageConnection.validateState(expectedToFail);
        jiraStageConnection.edit(jiraStageConnectionData);
    });

    it("Delete Jira Stage connection and cancel deletion", () => {
        jiraStageConnection.delete(toBeCanceled);
    });

    after("Cleanup", () => {
        jiraCloudConnection.delete();
        jiraStageConnection.delete();
        jiraBasicCredential.delete();
        jiraBasicStageCredential.delete();
    });
});
