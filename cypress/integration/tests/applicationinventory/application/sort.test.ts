/// <reference types="cypress" />

import {
    login,
    clickByText,
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory, name, tags } from "../../../types/constants";

import * as data from "../../../../utils/data_utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

var applicationsList: Array<ApplicationInventory> = [];

describe("Business services sort validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();
        var tagsList = ["C++", "COBOL", "Java"];
        // Create multiple applications with tags
        for (let i = 0; i < 3; i++) {
            // Create new application
            const application = new ApplicationInventory(data.getFullName(), "", "", "", tagsList);
            application.create();
            applicationsList.push(application);
            tagsList.pop();
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Delete the applications created before the tests

        applicationsList.forEach(function (application) {
            application.delete();
        });
    });

    it("Name sort validations", function () {
        // Navigate to application inventory page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the application inventory by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });
    it("Tag(s) sort validations", function () {
        // Navigate to application inventory page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(tags);

        // Sort the application inventory by tags in ascending order
        sortAsc(tags);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tags);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by tags in descending order
        sortDesc(tags);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tags);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
