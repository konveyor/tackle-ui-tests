import { login } from "../../../../utils/utils";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { JiraCredentialsBasic } from "../../../models/administration/credentials/jiraCredentialsBasic";
import { CredentialsData } from "../../../types/types";
// import { CredentialsTokenJira } from "../../../models/administration/credentials/credentialsTokenJira";

// Commented Token tests as now they can't be run because of missing environment.
describe(["@tier2"], "Validation of jira credentials", () => {
    const toBeCanceled = true;
    let validJiraBasicCredentials: CredentialsData;
    let randomJiraBasicCredentials: CredentialsData;
    // let validJiraTokenCredentials: CredentialsData;
    // let randomJiraTokenCredentials: CredentialsData;
    let jiraBasicCredentials: JiraCredentialsBasic;
    // let jiraTokenCredentials: CredentialsTokenJira;

    before("Login", function () {
        // Perform login
        login();
        validJiraBasicCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", true);
        randomJiraBasicCredentials = getRandomCredentialsData(CredentialType.jiraBasic, "", false);
        jiraBasicCredentials = new JiraCredentialsBasic(randomJiraBasicCredentials);

        // validJiraTokenCredentials = getRandomCredentialsData(CredentialType.jiraToken, "", true);
        // randomJiraTokenCredentials = getRandomCredentialsData(CredentialType.jiraToken, "", false);
        // jiraTokenCredentials = new CredentialsTokenJira(randomJiraTokenCredentials);
    });

    it("Creating Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.create(toBeCanceled);
        // jiraTokenCredentials.create(toBeCanceled);
    });

    it("Creating Jira credentials", () => {
        jiraBasicCredentials.create();
        // jiraTokenCredentials.create();
    });

    it("Editing Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials, toBeCanceled);
        // jiraTokenCredentials.edit(validJiraBasicCredentials, toBeCanceled);
    });

    it("Editing Jira credentials", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials);
        // jiraTokenCredentials.edit(validJiraBasicCredentials);
    });

    it("Delete Jira credentials and cancel deletion", () => {
        jiraBasicCredentials.delete(toBeCanceled);
        // jiraTokenCredentials.delete(toBeCanceled);
    });

    after("Delete Jira credentials", () => {
        jiraBasicCredentials.delete();
        // jiraTokenCredentials.delete();
    });
});
