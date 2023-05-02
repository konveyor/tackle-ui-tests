import {
    clearAllFilters,
    createMultipleCredentials,
    deleteByList,
    exists,
    hasToBeSkipped,
    login,
    logout,
    notExists,
    preservecookies,
} from "../../../../utils/utils";
import { Credentials } from "../../../models/administration/credentials/credentials";
import * as data from "../../../../utils/data_utils";
import { UserAdmin } from "../../../models/keycloak/users/userAdmin";
import { getRandomUserData } from "../../../../utils/data_utils";
import { User } from "../../../models/keycloak/users/user";

describe("Credentials filter validations", { tags: "@tier2" }, function () {
    let adminUserName = Cypress.env("user");
    let adminUserPassword = Cypress.env("pass");
    let credentialsListByDefaultAdmin: Array<Credentials> = [];
    let credentialsListByNewAdmin: Array<Credentials> = [];
    let invalidSearchInput = String(data.getRandomNumber());

    const newAdminUser = new UserAdmin(getRandomUserData());
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;
        /*
        1. Login to RBAC and create new admin user because only admins can create credentials.
        2. Logout from RBAC and login to Tackle as user created in step 1
        3. Create several credentials
        4. Logout from Tackle and login as default admin
        5. Create few more credentials
        6. Apply filtering
        */
        User.loginKeycloakAdmin();
        newAdminUser.create();
        newAdminUser.login();
        credentialsListByNewAdmin = createMultipleCredentials(4);
        newAdminUser.logout();

        // Perform login
        login(adminUserName, adminUserPassword);

        // Create multiple credentials of all types
        credentialsListByDefaultAdmin = createMultipleCredentials(4);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
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
        cy.get("h2").contains("No credentials available");

        clearAllFilters();
    });

    it("Type filter validations", () => {
        Credentials.filterByType();
    });

    it("Creator filter validations", () => {
        Credentials.filterByCreator(adminUserName);
        Credentials.filterByCreator(newAdminUser.username);
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Deleting all credentials created before test
        deleteByList(credentialsListByDefaultAdmin);
        deleteByList(credentialsListByNewAdmin);
        logout(adminUserName);
        User.loginKeycloakAdmin();
        newAdminUser.delete();
    });
});
