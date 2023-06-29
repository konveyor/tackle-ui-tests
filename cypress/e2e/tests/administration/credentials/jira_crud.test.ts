import { login } from "../../../../utils/utils";
import { getJiraCredentialData, getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { CredentialsData } from "../../../types/types";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";

// Commented Token tests as now they can't be run because of missing environment.
describe(["@tier1"], "Validation of jira credentials", () => {
    const toBeCanceled = true;
    let validJiraBasicCredentials: CredentialsData;
    let randomJiraBasicCredentials: CredentialsData;
    let jiraBasicCredentials: JiraCredentials;
    const useTestingAccount = true;

    before("Login", function () {
        // Perform login
        login();
        validJiraBasicCredentials = randomJiraBasicCredentials = getJiraCredentialData(
            CredentialType.jiraBasic,
            !useTestingAccount
        );
        jiraBasicCredentials = new JiraCredentials(randomJiraBasicCredentials);
    });

    it("Creating Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.create(toBeCanceled);
    });

    it("Creating Jira credentials", () => {
        jiraBasicCredentials.create();
    });

    it("Editing Jira credentials and cancelling without saving", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials, toBeCanceled);
    });

    it("Editing Jira credentials", () => {
        jiraBasicCredentials.edit(validJiraBasicCredentials);
    });

    it("Delete Jira credentials and cancel deletion", () => {
        jiraBasicCredentials.delete(toBeCanceled);
    });

    after("Delete Jira credentials", () => {
        jiraBasicCredentials.delete();
    });
});
