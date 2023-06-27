import { login } from "../../../../utils/utils";
import {
    getJiraConnectionData,
    getJiraAtlassianCloudCredential,
    getRandomCredentialsData,
} from "../../../../utils/data_utils";
import { CredentialType, JiraType } from "../../../types/constants";
import { CredentialsBasicJira } from "../../../models/administration/credentials/credentialsBasicJira";
import { CredentialsData, JiraConnectionData } from "../../../types/types";
import { CredentialsTokenJira } from "../../../models/administration/credentials/credentialsTokenJira";
import { Jira } from "../../../models/administration/jira-connection/jira";

describe(["@tier2"], "CRUD operations for Jira Server connection instance", () => {
    const toBeCanceled = true;
    const notToBeCanceled = false;
    const expectedToFail = true;
    const useTestingAccount = true;
    const useFakeAccount = false;
    const isSecure = false;
    let jiraBasicCredential: CredentialsBasicJira;
    let jiraCloudConnectionData: JiraConnectionData;
    let jiraCloudConnectionDataIncorrect: JiraConnectionData;
    let jiraCloudConnection: Jira;
    const jira_url = Cypress.env("jira_url");

    before("Login", function () {
        // Perform login
        login();
        // Defining and creating credentials to be used in test
        jiraBasicCredential = getJiraAtlassianCloudCredential(useTestingAccount);

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
            useFakeAccount
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
