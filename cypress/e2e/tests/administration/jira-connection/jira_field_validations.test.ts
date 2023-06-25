import { login } from "../../../../utils/utils";
import { getJiraConnectionData, getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, JiraType } from "../../../types/constants";
import { CredentialsBasicJira } from "../../../models/administration/credentials/credentialsBasicJira";
import { CredentialsData, JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira/jira";

let validJiraBasicCredentials: CredentialsData;
let jiraBasicCredential: CredentialsBasicJira;
let jiraServerConnectionData: JiraConnectionData;
let jiraServerConnection: Jira;
const jira_url = Cypress.env("jira_url");

describe(["@tier3"], "Field validations for Jira Server connection instance", () => {
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

        jiraServerConnection = new Jira(jiraServerConnectionData);
        jiraServerConnection.create();
    });

    it("Testing fields validation", () => {
        Jira.validateFields();
    });

    it("Testing duplicate error message", () => {
        jiraServerConnection.validateDuplicateName();
    });

    after("Delete Jira connection and Jira credentials", () => {
        jiraServerConnection.delete();
        jiraBasicCredential.delete();
    });
});
