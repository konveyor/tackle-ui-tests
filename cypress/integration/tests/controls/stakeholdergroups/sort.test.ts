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
import * as data from "../../../../utils/data_utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, stakeholdergroups, name, memberCount } from "../../../types/constants";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholdersList: Array<Stakeholders> = [];
var stakeholderNames: Array<string> = [];

describe("Stakeholder groups sort validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple stakeholder groups and stakeholders
        for (let i = 0; i < 3; i++) {
            // Create new stakeholder
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();
            stakeholdersList.push(stakeholder);
            stakeholderNames.push(stakeholder.name);

            // Create new stakeholder group
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription(),
                stakeholderNames
            );
            stakeholdergroup.create();
            stakeholdergroupsList.push(stakeholdergroup);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder groups and stakeholders created before the tests
        stakeholdergroupsList.forEach(function (stakeholdergroup) {
            stakeholdergroup.delete();
        });

        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });
    });

    it("Name sort validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Sort the stakeholder groups by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList);

        // Sort the stakeholder groups by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList);
    });

    it("Member(s) sort validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Sort the stakeholder groups by members in ascending order
        sortAsc(memberCount);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(memberCount);
        verifySortAsc(afterAscSortList);

        // Sort the stakeholder groups by members in descending order
        sortDesc(memberCount);
        cy.wait(2000);

        // Verify that the stakeholder groups table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(memberCount);
        verifySortDesc(afterDescSortList);
    });
});
