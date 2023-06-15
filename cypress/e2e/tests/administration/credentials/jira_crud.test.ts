import { login } from "../../../../utils/utils";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { CredentialsBasicJira } from "../../../models/administration/credentials/credentialsBasicJira";
import { CredentialsData } from "../../../types/types";

describe(["@tier2"], "Validation of jira credentials", () => {
    const toBeCanceled = true;
    let validJiraCredentials: CredentialsData;
    let randomJiraCredentials: CredentialsData;
    let jiraCredentials: CredentialsBasicJira;

    before("Login", function () {
        // Perform login
        login();
        validJiraCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", true);
        randomJiraCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", false);
        jiraCredentials = new CredentialsBasicJira(randomJiraCredentials);
    });

    it("Creating Jira credentials and cancelling without saving", () => {
        jiraCredentials.create(toBeCanceled);
    });

    it("Creating Jira credentials", () => {
        jiraCredentials.create();
    });

    it("Editing Jira credentials and cancelling without saving", () => {
        jiraCredentials.edit(validJiraCredentials, toBeCanceled);
    });

    it("Editing Jira credentials", () => {
        jiraCredentials.edit(validJiraCredentials);
    });

    it("Delete Jira credentials and cancel deletion", () => {
        jiraCredentials.delete(toBeCanceled);
    });

    after("Delete Jira credentials", () => {
        jiraCredentials.delete();
    });
});
