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
    createMultipleJobfunctions,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    deleteAllJobfunctions,
    deleteAllStakeholders,
    deleteAllStakeholderGroups,
} from "../../../../utils/utils";
const { _ } = Cypress;
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    email,
    stakeholders,
    displayName,
    jobfunction,
    groupCount,
} from "../../../types/constants";

import { Stakeholders } from "../../../models/stakeholders";
import { Jobfunctions } from "../../../models/jobfunctions";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";

var stakeholdersList: Array<Stakeholders> = [];
var jobfunctionsList: Array<Jobfunctions> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];

describe("Stakeholder sort validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Create multiple job functions, stakeholder groups and stakeholders
        jobfunctionsList = createMultipleJobfunctions(2);
        stakeholdergroupsList = createMultipleStakeholderGroups(2);
        stakeholdersList = createMultipleStakeholders(2, jobfunctionsList, stakeholdergroupsList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the job functions, stakeholder groups and stakeholders created before the tests
        deleteAllJobfunctions();
        deleteAllStakeholders();
        deleteAllStakeholderGroups();
    });

    it("Email sort validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(email);

        // Sort the stakeholders by email in ascending order
        sortAsc(email);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(email);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by email in descending order
        sortDesc(email);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(email);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Display name sort validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(displayName);

        // Sort the stakeholders by display name in ascending order
        sortAsc(displayName);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(displayName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by display name in descending order
        sortDesc(displayName);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(displayName);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Job function sort validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(jobfunction);

        // Sort the stakeholders by Job function in ascending order
        sortAsc(jobfunction);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(jobfunction);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by Job function in descending order
        sortDesc(jobfunction);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(jobfunction);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Group sort validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(groupCount);

        // Sort the stakeholders by group count in ascending order
        sortAsc(groupCount);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(groupCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by group count in descending order
        sortDesc(groupCount);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(groupCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
