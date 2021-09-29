/// <reference types="cypress" />

import {
    login,
    clickByText,
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    preservecookies,
    hasToBeSkipped,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import { applicationinventory, name, tagCount, review } from "../../../types/constants";

import * as data from "../../../../utils/data_utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

var applicationsList: Array<ApplicationInventory> = [];

describe("Application inventory sort validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

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
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplications");
    });

    after("Perform test data clean up", function () {
        // Delete the applications created before the tests
        applicationsList.forEach(function (application) {
            cy.get(".pf-c-table > tbody > tr")
                .not(".pf-c-table__expandable-row")
                .find("td[data-label=Name]")
                .each(($rows) => {
                    if ($rows.text() === application.name) application.delete();
                });
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

    it("Review sort validations", function () {
        // Navigate to application inventory page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(review);

        // Sort the application inventory by review in ascending order
        sortAsc(review);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(review);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by name in descending order
        sortDesc(review);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(review);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Tag count sort validations", function () {
        // Navigate to application inventory page
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplications");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(tagCount);

        // Sort the application inventory by Tag count in ascending order
        sortAsc(tagCount);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(tagCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the application inventory by tags in descending order
        sortDesc(tagCount);
        cy.wait(2000);

        // Verify that the application inventory table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(tagCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
