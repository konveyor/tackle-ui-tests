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

import * as data from "../../../../utils/data_utils";
import { getJiraCredentialData } from "../../../../utils/data_utils";
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
import { jiraTable } from "../../../views/jira.view";

describe(["@tier3"], "Jira connection filter validations", () => {
    const useTestingAccount = true;
    let jiraBasicCredential: JiraCredentials;
    let jiraConnectionList: Jira[];
    let invalidSearchInput = String(data.getRandomNumber());

    before("", () => {
        login();
        cy.visit("/");
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

        // Searching for invalid name:
        Jira.applyFilterByName(invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No jira configuration available");

        clearAllFilters();
    });

    after("Clean up", () => {
        deleteByList(jiraConnectionList);
        jiraBasicCredential.delete();
    });
});
