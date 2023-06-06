import { login } from "../../../../utils/utils";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { CredentialsJira } from "../../../models/administration/credentials/credentialsJira";

describe(["@tier2"], "Validation of jira credentials", () => {
    const toBeCanceled = true;
    const validJiraCredentials = getRandomCredentialsData(CredentialType.jira, "", true);
    const randomJiraCredentials = getRandomCredentialsData(CredentialType.jira, "", false);
    const jiraCredentials = new CredentialsJira(randomJiraCredentials);

    before("Login", function () {
        // Perform login
        login();
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
