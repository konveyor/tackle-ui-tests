import {
    applySearchFilter,
    clearAllFilters,
    createMultipleCredentials,
    deleteByList,
    exists,
    hasToBeSkipped,
    login,
    notExists,
    preservecookies,
} from "../../../../utils/utils";
import { Credentials } from "../../../models/administrator/credentials/credentials";
import { name } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";

describe("Credentials filter validations", { tags: "@tier2" }, function () {
    let credentialsList: Array<Credentials> = [];
    let invalidSearchInput = String(data.getRandomNumber());
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Create multiple credentials of all types
        credentialsList = createMultipleCredentials(4);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Name filter validations", () => {
        Credentials.openList(100);

        // Searching by first letters of name:
        let firstName = credentialsList[0].name;
        let secondName = credentialsList[1].name;
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
        cy.get("h2").contains("No credentials available");

        clearAllFilters();
    });

    it("Type filter validations", () => {
        Credentials.filterByType();
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Deleting all credentials created before test
        deleteByList(credentialsList);
    });
});
