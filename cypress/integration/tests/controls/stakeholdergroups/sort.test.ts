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
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, stakeholderGroups, name, memberCount } from "../../../types/constants";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholdersList: Array<Stakeholders> = [];

describe("Stakeholder groups sort validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Create multiple stakeholder groups and stakeholders
        stakeholdersList = createMultipleStakeholders(3);
        stakeholdergroupsList = createMultipleStakeholderGroups(3, stakeholdersList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the stakeholder groups and stakeholders created before the tests
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
    });

    it("Name sort validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholderGroups);
        cy.wait("@getStakeholdergroups");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the stakeholder groups by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholder groups by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Member(s) sort validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholderGroups);
        cy.wait("@getStakeholdergroups");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(memberCount);

        // Sort the stakeholder groups by members in ascending order
        sortAsc(memberCount);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(memberCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholder groups by members in descending order
        sortDesc(memberCount);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(memberCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
