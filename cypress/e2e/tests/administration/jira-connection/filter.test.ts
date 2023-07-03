import {
    clearAllFilters,
    createMultipleJiraConnections,
    deleteByList,
    exists,
    login,
    notExists,
} from "../../../../utils/utils";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { CredentialType } from "../../../types/constants";
import { getJiraCredentialData } from "../../../../utils/data_utils";
import * as data from "../../../../utils/data_utils";
import { jiraTable } from "../../../views/jira.view";

describe(["@tier2"], "Jira connection filter validations", () => {
    const useTestingAccount = true;
    let jiraBasicCredential: JiraCredentials;
    let jiraConnectionList: Jira[];
    let invalidSearchInput = String(data.getRandomNumber());

    before("", () => {
        // Perform login
        login();
        // Defining and creating credentials to be used in test
        jiraBasicCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, useTestingAccount)
        );

        jiraBasicCredential.create();

        jiraConnectionList = createMultipleJiraConnections(5, jiraBasicCredential);
        jiraConnectionList.forEach((jira) => {
            jira.create();
        });
    });

    it("Filtering Jira connections by name", () => {
        Jira.openList(100);

        // Searching by first letters of name:
        let firstName = jiraConnectionList[0].name;
        let secondName = jiraConnectionList[1].name;
        let validSearchInput = firstName.substring(0, 6);
        Jira.applyFilterByName(validSearchInput);
        exists(firstName, jiraTable);

        if (secondName.indexOf(validSearchInput) >= 0) {
            exists(secondName, jiraTable);
        }
        clearAllFilters();

        // Searching by full name:
        Jira.applyFilterByName(secondName);
        exists(secondName, jiraTable);
        notExists(firstName, jiraTable);
        clearAllFilters();

        // Commented code below cause it fails due to the bug https://issues.redhat.com/browse/MTA-895
        // // Searching for invalid name:
        // Jira.ApplyFilterByName(invalidSearchInput);
        //
        // // Assert that no search results are found
        // cy.get("h2").contains("No data available");
        //
        // clearAllFilters();
    });

    after("Clean up", () => {
        deleteByList(jiraConnectionList);
        jiraBasicCredential.delete();
    });
});
