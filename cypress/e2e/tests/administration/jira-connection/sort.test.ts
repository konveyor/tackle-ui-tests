/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import { getJiraCredentialData } from "../../../../utils/data_utils";
import {
    clickOnSortButton,
    createMultipleJiraConnections,
    getTableColumnData,
    login,
    verifySortAsc,
    verifySortDesc,
} from "../../../../utils/utils";
import { JiraCredentials } from "../../../models/administration/credentials/JiraCredentials";
import { Jira } from "../../../models/administration/jira-connection/jira";
import { CredentialType, instanceName, SortType } from "../../../types/constants";
import { jiraTable } from "../../../views/jira.view";

describe(["@tier3"], "Jira connections sort validations", function () {
    const useTestingAccount = true;
    let jiraBasicCredential: JiraCredentials;
    let jiraConnectionList: Jira[];
    let isInsecure = false;

    before("", () => {
        login();
        cy.visit("/");
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
            jira.create();
        });
    });

    it("Name sort validations", function () {
        Jira.openList();
        // get unsorted list when page loads
        const unsortedList = getTableColumnData(instanceName);

        // Sort the Jira instances by Name in ascending order
        clickOnSortButton(instanceName, SortType.ascending, jiraTable);

        // Verify that the Jira instances table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(instanceName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Jira instances by Name in descending order
        clickOnSortButton(instanceName, SortType.descending, jiraTable);

        // Verify that the Jira instances table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(instanceName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("URL sort validations", function () {
        Jira.openList();
        // get unsorted list when page loads
        const unsortedList = getTableColumnData("URL");

        // Sort the Jira instances by URL in ascending order
        clickOnSortButton("URL", SortType.ascending, jiraTable);

        // Verify that the Jira instances table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData("URL");
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the Jira instances by URL in descending order
        clickOnSortButton("URL", SortType.descending, jiraTable);

        // Verify that the Jira instances table rows are displayed in descending order
        const afterDescSortList = getTableColumnData("URL");
        verifySortDesc(afterDescSortList, unsortedList);
    });

    after("Clean up", () => {
        jiraConnectionList.forEach((current_connection) => {
            current_connection.delete();
        });
        jiraBasicCredential.delete();
    });
});
