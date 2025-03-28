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

import {
    clearAllFilters,
    createMultipleCredentials,
    deleteByList,
    exists,
    login,
    notExists,
} from "../../../../utils/utils";
import { Credentials } from "../../../models/administration/credentials/credentials";

describe(["@tier3"], "Credentials filter validations", function () {
    let adminUserName = Cypress.env("user");
    let credentialsListByDefaultAdmin: Array<Credentials> = [];
    let invalidSearchInput = String(data.getRandomNumber());

    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        credentialsListByDefaultAdmin = createMultipleCredentials(8);
    });

    it("Name filter validations", () => {
        Credentials.openList(100);

        // Searching by first letters of name:
        let firstName = credentialsListByDefaultAdmin[0].name;
        let secondName = credentialsListByDefaultAdmin[1].name;
        let validSearchInput = firstName.substring(0, 3);
        Credentials.ApplyFilterByName(validSearchInput);
        exists(firstName);

        if (secondName.indexOf(validSearchInput) >= 0) {
            exists(secondName);
        }
        clearAllFilters();

        // Searching by full name:
        Credentials.ApplyFilterByName(secondName);
        exists(secondName);
        notExists(firstName);
        clearAllFilters();

        // Searching for invalid name:
        Credentials.ApplyFilterByName(invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No credential available");

        clearAllFilters();
    });

    it("Type filter validations", () => {
        Credentials.filterByType();
    });

    it("Creator filter validations", () => {
        Credentials.filterByCreator(adminUserName);
    });

    after("Perform test data clean up", function () {
        deleteByList(credentialsListByDefaultAdmin);
    });
});
