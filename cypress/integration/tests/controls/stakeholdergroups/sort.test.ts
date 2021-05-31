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
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, stakeholdergroups, name, members } from "../../../types/constants";

import { Stakeholdergroups } from "../../../models/stakeholdergroups";

import * as data from "../../../../utils/data_utils";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholderGroupNames: Array<string> = [];

describe("Stakeholder sort validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple stakeholder groups
        for (let i = 0; i < 2; i++) {
            // Create new stakeholder group
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription()
            );
            stakeholdergroup.create();
            stakeholdergroupsList.push(stakeholdergroup);
            stakeholderGroupNames.push(stakeholdergroup.name);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder groups created before the tests
        stakeholdergroupsList.forEach(function (stakeholdergroup) {
            stakeholdergroup.delete();
        });
    });

    it("Name sort validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Sort the stakeholder groups by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the stakeholder group rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList);

        // Sort the stakeholder groups by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the stakeholder groups rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList);
    });

    it("Member(s) sort validations", function () {
        // Navigate to stakeholder groups tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
        cy.wait("@getStakeholdergroups");

        // Sort the stakeholder groups by members in ascending order
        sortAsc(members);
        cy.wait(2000);

        // Verify that the stakeholder groups rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(members);
        verifySortAsc(afterAscSortList);

        // Sort the stakeholder groups by members in descending order
        sortDesc(members);
        cy.wait(2000);

        // Verify that the stakeholder groups rows are displayed in descending order
        const afterDescSortList = getTableColumnData(members);
        verifySortDesc(afterDescSortList);
    });
});
