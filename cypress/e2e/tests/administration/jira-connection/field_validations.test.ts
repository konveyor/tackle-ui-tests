import {
    cancelForm,
    click,
    doesExistText,
    inputText,
    login,
    validateTooLongInput,
    validateTooShortInput,
} from "../../../../utils/utils";
import { getJiraConnectionData, getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, JiraType } from "../../../types/constants";
import { JiraCredentialsBasic } from "../../../models/administration/credentials/jiraCredentialsBasic";
import { CredentialsData, JiraConnectionData } from "../../../types/types";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { createJiraButton, instanceName, instanceUrl } from "../../../views/jira.view";

let validJiraBasicCredentials: CredentialsData;
let jiraBasicCredential: JiraCredentialsBasic;
let jiraServerConnectionData: JiraConnectionData;
let jiraServerConnection: Jira;
const jira_url = Cypress.env("jira_url");

describe(["@tier3"], "Field validations for Jira Server connection instance", () => {
    before("Login", function () {
        // Perform login
        login();
        // Defining and creating credentials to be used in test
        validJiraBasicCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", true);
        jiraBasicCredential = new JiraCredentialsBasic(validJiraBasicCredentials);

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
        validateTooLongInput(instanceUrl, null, 251);
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
