import {
    clickOnSortButton,
    createMultipleJiraConnections,
    deleteByList,
    getTableColumnData,
    login,
    verifySortAsc,
    verifySortDesc,
} from "../../../../utils/utils";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { getJiraCredentialData } from "../../../../utils/data_utils";
import { CredentialType, instanceName, SEC, SortType } from "../../../types/constants";
import { jiraTable } from "../../../views/jira.view";

describe(["@tier2"], "Jira connections sort validations", function () {
    const useTestingAccount = true;
    let jiraBasicCredential: JiraCredentials;
    let jiraConnectionList: Jira[];
    let isInsecure = false;
    let toBeCanceled = true;
    let expectedToFail = true;

    before("", () => {
        login();
        // Defining and creating credentials to be used in test
        jiraBasicCredential = new JiraCredentials(
            getJiraCredentialData(CredentialType.jiraBasic, !useTestingAccount)
        );

        jiraBasicCredential.create();

        jiraConnectionList = createMultipleJiraConnections(
            5,
            jiraBasicCredential,
            isInsecure,
            !useTestingAccount
        );
        jiraConnectionList.forEach((jira) => {
            jira.create(!toBeCanceled, expectedToFail);
        });
    });

    it("Name sort validations", function () {
        Jira.openList();
        // get unsorted list when page loads
        const unsortedList = getTableColumnData(instanceName);

        // Sort the Jira instances by Name in ascending order
        clickOnSortButton(instanceName, SortType.ascending, jiraTable);
        cy.wait(2 * SEC);

        // Verify that the Jira instances table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(instanceName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Jira instances by Name in descending order
        clickOnSortButton(instanceName, SortType.descending, jiraTable);
        cy.wait(2 * SEC);

        // Verify that the Jira instances table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(instanceName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it.skip("BUG MTA-908 - URL sort validations", function () {
        Jira.openList();
        // get unsorted list when page loads
        const unsortedList = getTableColumnData("URL");

        // Sort the Jira instances by URL in ascending order
        clickOnSortButton("URL", SortType.ascending, jiraTable);
        cy.wait(2 * SEC);

        // Verify that the Jira instances table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData("URL");
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Jira instances by URL in descending order
        clickOnSortButton("URL", SortType.descending, jiraTable);
        cy.wait(2 * SEC);

        // Verify that the Jira instances table rows are displayed in descending order
        const afterDescSortList = getTableColumnData("URL");
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Clean up", () => {
        deleteByList(jiraConnectionList);
        jiraBasicCredential.delete();
    });
});
