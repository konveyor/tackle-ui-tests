import { login } from "../../../../utils/utils";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { CredentialsBasicJira } from "../../../models/administration/credentials/credentialsBasicJira";
import { CredentialsData } from "../../../types/types";

describe(["@tier2"], "Validation of jira credentials", () => {
    const toBeCanceled = true;
    let validJiraBasicCredentials: CredentialsData;
    let randomJiraBasicCredentials: CredentialsData;
    let validJiraTokenCredentials: CredentialsData;
    let randomJiraTokenCredentials: CredentialsData;
    let jiraBasicCredentials: CredentialsBasicJira;
    let jiraTokenCredentials: CredentialsBasicJira;

    before("Login", function () {
        // Perform login
        login();
        validJiraBasicCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", true);
        randomJiraBasicCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", false);
        jiraBasicCredentials = new CredentialsBasicJira(randomJiraBasicCredentials);

        validJiraTokenCredentials = getRandomCredentialsData(CredentialType.jiraToken, "", true);
        randomJiraTokenCredentials = getRandomCredentialsData(CredentialType.jiraToken, "", false);
        jiraTokenCredentials = new CredentialsBasicJira(randomJiraBasicCredentials);
    });

    it("Creating Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.create(toBeCanceled);
        jiraTokenCredentials.create(toBeCanceled);
    });

    it("Creating Jira credentials", () => {
        jiraBasicCredentials.create();
        jiraTokenCredentials.create();
    });

    it("Editing Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials, toBeCanceled);
        jiraTokenCredentials.edit(validJiraBasicCredentials, toBeCanceled);
    });

    it("Editing Jira credentials", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials);
        jiraTokenCredentials.edit(validJiraBasicCredentials);
    });

    it("Delete Jira credentials and cancel deletion", () => {
        jiraBasicCredentials.delete(toBeCanceled);
        jiraTokenCredentials.delete(toBeCanceled);
    });

    after("Delete Jira credentials", () => {
        jiraBasicCredentials.delete();
        jiraTokenCredentials.delete();
    });
});
