import { login } from "../../../../utils/utils";
import {
    getJiraConnectionData,
    getJiraCredential,
    getRandomCredentialsData,
} from "../../../../utils/data_utils";
import { CredentialType, JiraType } from "../../../types/constants";
import { JiraCredentialsBasic } from "../../../models/administration/credentials/jiraCredentialsBasic";
import { CredentialsData, JiraConnectionData } from "../../../types/types";
import { JiraCredentialsBearer } from "../../../models/administration/credentials/jiraCredentialsBearer";
import { Jira } from "../../../models/administration/jira-connection/jira";

describe(["@tier2"], "CRUD operations for Jira Cloud instance", () => {
    const toBeCanceled = true;
    const notToBeCanceled = false;
    const expectedToFail = true;
    const useTestingAccount = true;
    const useDummyAccount = false;
    const isSecure = false;
    let jiraBasicCredential: JiraCredentialsBasic | JiraCredentialsBearer;
    let jiraCloudConnectionData: JiraConnectionData;
    let jiraCloudConnectionDataIncorrect: JiraConnectionData;
    let jiraCloudConnection: Jira;

    before("Login", function () {
        // Perform login
        login();
        // Defining and creating credentials to be used in test
        jiraBasicCredential = getJiraCredential(CredentialType.jiraBasic, useTestingAccount);

        jiraBasicCredential.create();

        // Defining correct data to create new Jira Cloud connection
        jiraCloudConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            isSecure,
            useTestingAccount
        );

        // Defining fake data to edit Jira Cloud connection
        jiraCloudConnectionDataIncorrect = getJiraConnectionData(
            jiraBasicCredential,
            isSecure,
            useDummyAccount
        );

        jiraCloudConnection = new Jira(jiraCloudConnectionData);
    });

    it("Creating Jira connection and cancelling without saving", () => {
        jiraCloudConnection.create(toBeCanceled);
    });

    it("Creating Jira connection", () => {
        jiraCloudConnection.create();
    });

    it("Editing Jira connection and cancelling without saving", () => {
        jiraCloudConnection.edit(jiraCloudConnectionDataIncorrect, toBeCanceled);
    });

    it("Editing Jira credentials with incorrect data, then configuring back with correct", () => {
        jiraCloudConnection.edit(jiraCloudConnectionDataIncorrect, notToBeCanceled, expectedToFail);
        jiraCloudConnection.edit(jiraCloudConnectionData);
    });

    it("Delete Jira connection and cancel deletion", () => {
        jiraCloudConnection.delete(toBeCanceled);
    });

    after("Delete Jira connection and Jira credentials", () => {
        jiraCloudConnection.delete();
        jiraBasicCredential.delete();
    });
});
