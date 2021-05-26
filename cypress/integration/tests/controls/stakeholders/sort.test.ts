/// <reference types="cypress" />

import {
    login,
    clickByText,
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, stakeholders } from "../../../types/constants";

import { Stakeholders } from "../../../models/stakeholders";
import { Jobfunctions } from "../../../models/jobfunctions";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";

import * as data from "../../../../utils/data_utils";

var stakeholdersList: Array<Stakeholders> = [];
var jobfunctionsList: Array<Jobfunctions> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];

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

            // Create new stakeholder
            const stakeholder = new Stakeholders(
                data.getEmail(),
                data.getFullName(),
                jobfunction.name,
                [stakeholdergroup.name]
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
        cy.wait("@getStakeholders");

        // Sort the stakeholders by email in ascending order
        sortAsc("Email");
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        verifySortAsc("Email");

        // Sort the stakeholders by email in descending order
        sortDesc("Email");
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        verifySortDesc("Email");
    });

    it("Display name sort validations", function () {
        // Navigate to stakeholder tab
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
        cy.wait("@getStakeholders");

        // Sort the stakeholders by display name in ascending order
        sortAsc("Display name");
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in ascending order
        verifySortAsc("Display name");

        // Sort the stakeholders by display name in descending order
        sortDesc("Display name");
        cy.wait(2000);

        // Verify that the stakeholder rows are displayed in descending order
        verifySortDesc("Display name");
    });
});
