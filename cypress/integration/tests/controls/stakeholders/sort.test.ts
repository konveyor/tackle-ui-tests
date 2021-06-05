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

import * as data from "../../../../utils/data_utils";

var stakeholdersList: Array<Stakeholders> = [];
var jobfunctionsList: Array<Jobfunctions> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholderGroupNames: Array<string> = [];

describe("Stakeholder sort validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple job functions, stakeholder groups and stakeholders
        for (let i = 0; i < 2; i++) {
            // Create new job function
            const jobfunction = new Jobfunctions(data.getJobTitle());
            jobfunction.create();
            jobfunctionsList.push(jobfunction);

            // Create new stakeholder group
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription()
            );
            stakeholdergroup.create();
            stakeholdergroupsList.push(stakeholdergroup);
            stakeholderGroupNames.push(stakeholdergroup.name);

            // Create new stakeholder
            const stakeholder = new Stakeholders(
                data.getEmail(),
                data.getFullName(),
                jobfunction.name,
                stakeholderGroupNames
            );
            stakeholder.create();
            stakeholdersList.push(stakeholder);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    after("Perform test data clean up", function () {
        // Delete the job functions, stakeholder groups and stakeholders created before the tests
        jobfunctionsList.forEach(function (jobfunction) {
            jobfunction.delete();
        });

        stakeholdergroupsList.forEach(function (stakeholdergroup) {
            stakeholdergroup.delete();
        });

        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });
    });

    it("Email sort validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");cy.wait("@getStakeholders");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(email);

        // Sort the stakeholders by email in ascending order
        cy.wait(2000);
        sortAsc(email);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(email);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by email in descending order
        cy.wait(2000);
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
        cy.wait(2000);
        sortAsc(displayName);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(displayName);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by display name in descending order
        cy.wait(2000);
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
        cy.wait(2000);
        sortAsc(jobfunction);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(jobfunction);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by Job function in descending order
        cy.wait(2000);
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
        cy.wait(2000);
        sortAsc(groupCount);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(groupCount);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the stakeholders by group count in descending order
        cy.wait(2000);
        sortDesc(groupCount);
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        const afterDescSortList = getTableColumnData(groupCount);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
