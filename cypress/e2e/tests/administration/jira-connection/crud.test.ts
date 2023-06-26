import { login } from "../../../../utils/utils";
import { getJiraConnectionData, getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, JiraType } from "../../../types/constants";
import { CredentialsBasicJira } from "../../../models/administration/credentials/credentialsBasicJira";
import { CredentialsData, JiraConnectionData } from "../../../types/types";
import { CredentialsTokenJira } from "../../../models/administration/credentials/credentialsTokenJira";
import { Jira } from "../../../models/administration/jira-connection/jira";

describe(["@tier2"], "CRUD operations for Jira Server connection instance", () => {
    const toBeCanceled = true;
    const notToBeCanceled = false;
    const expectedToFail = true;
    let validJiraBasicCredentials: CredentialsData;
    let jiraBasicCredential: CredentialsBasicJira;
    let jiraServerConnectionData: JiraConnectionData;
    let jiraServerConnectionDataIncorrect: JiraConnectionData;
    let jiraServerConnection: Jira;
    const jira_url = Cypress.env("jira_url");

    before("Login", function () {
        // Perform login
        login();
        // Defining and creating credentials to be used in test
        validJiraBasicCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", true);
        jiraBasicCredential = new CredentialsBasicJira(validJiraBasicCredentials);

        jiraBasicCredential.create();

        // Defining correct data to create new Jira connection
        jiraServerConnectionData = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.cloud,
            jira_url
        );

        // Defining fake data to edit Jira connection
        jiraServerConnectionDataIncorrect = getJiraConnectionData(
            jiraBasicCredential,
            JiraType.cloud,
            "https://test.com"
        );

        jiraServerConnection = new Jira(jiraServerConnectionData);
    });

    it("Creating Jira connection and cancelling without saving", () => {
        jiraServerConnection.create(toBeCanceled);
    });

    it("Creating Jira connection", () => {
        jiraServerConnection.create();
    });

    it("Editing Jira connection and cancelling without saving", () => {
        jiraServerConnection.edit(jiraServerConnectionDataIncorrect, toBeCanceled);
    });

    it("Editing Jira credentials with incorrect data, then configuring back with correct", () => {
        jiraServerConnection.edit(
            jiraServerConnectionDataIncorrect,
            notToBeCanceled,
            expectedToFail
        );
        jiraServerConnection.edit(jiraServerConnectionData);
    });

    it("Delete Jira connection and cancel deletion", () => {
        jiraServerConnection.delete(toBeCanceled);
    });

    after("Delete Jira connection and Jira credentials", () => {
        jiraServerConnection.delete();
        jiraBasicCredential.delete();
    });
});
