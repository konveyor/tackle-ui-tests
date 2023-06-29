import { login } from "../../../../utils/utils";
import { getJiraConnectionData, getJiraCredentialData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";

describe(["@tier1"], "CRUD operations for Jira Cloud instance", () => {
    const toBeCanceled = true;
    const expectedToFail = true;
    const useTestingAccount = true;
    const isSecure = false;
    let jiraBasicCredential: JiraCredentials;
    let jiraCloudConnectionData: JiraConnectionData;
    let jiraCloudConnectionDataIncorrect: JiraConnectionData;
    let jiraCloudConnection: Jira;

    before("Login", function () {
        // Perform login
        login();
        // Defining and creating credentials to be used in test
        jiraBasicCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, useTestingAccount)
        );

        jiraBasicCredential.create();

        // Defining correct data to create new Jira Cloud connection
        jiraCloudConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            isSecure,
            useTestingAccount
        );

        // Defining dummy data to edit Jira Cloud connection
        jiraCloudConnectionDataIncorrect = getJiraConnectionData(
            jiraBasicCredential,
            isSecure,
            !useTestingAccount
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
        jiraCloudConnection.edit(jiraCloudConnectionDataIncorrect, !toBeCanceled, expectedToFail);
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
