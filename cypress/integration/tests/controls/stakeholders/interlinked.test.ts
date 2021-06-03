/// <reference types="cypress" />

import {
    login,
    selectItemsPerPage,
    click,
    clickByText,
    exists,
    notExists,
} from "../../../../utils/utils";
import { navTab } from "../../../views/menu.view";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Stakeholders } from "../../../models/stakeholders";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag, trTag, stakeholders } from "../../../types/constants";
import { expandRow } from "../../../views/common.view";
import * as data from "../../../../utils/data_utils";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholdergroupNames: Array<string> = [];

describe("Stakeholder linked to stakeholder groups and job function", () => {
    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Login", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors for stakeholder groups
        cy.intercept("POST", "/api/controls/stakeholder-group*").as("postStakeholdergroups");
        cy.intercept("GET", "/api/controls/stakeholder-group*").as("getStakeholdergroups");

        // Interceptors for stakeholders
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");

        // Interceptors for job functions
        cy.intercept("POST", "/api/controls/job-function*").as("postJobfunction");
        cy.intercept("GET", "/api/controls/job-function*").as("getJobfunctions");
    });

    it("Stakeholder group attach, update and delete dependency on stakeholder", function () {
        // Create two stakeholder groups
        for (let i = 0; i < 2; i++) {
            // Create new stakeholder groups
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription()
            );
            stakeholdergroup.create();
            stakeholdergroupsList.push(stakeholdergroup);
            stakeholdergroupNames.push(stakeholdergroup.name);
        }

        // Create new stakeholder and attach two stakeholder groups
        const stakeholder = new Stakeholders(
            data.getEmail(),
            data.getFullName(),
            "",
            stakeholdergroupNames
        );
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Check if both the stakeholder groups got attached to stakeholder
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdergroupNames[0])
            .and("contain", stakeholdergroupNames[1]);

        // Update name of second stakeholder group
        var updatedStakeholderGroupName = data.getCompanyName();
        stakeholdergroupsList[1].edit({ name: updatedStakeholderGroupName });
        cy.wait("@getStakeholdergroups");
        cy.wait(2000);

        // Navigate to stakeholder page
        clickByText(navTab, stakeholders);

        // Verify if the second stakeholder group's name attached to the stakeholder got updated
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", updatedStakeholderGroupName);

        // Delete second stakeholder group
        stakeholdergroupsList[1].delete();
        cy.wait("@getStakeholdergroups");

        // Assert that second stakeholder group got deleted
        notExists(stakeholdergroupsList[1].name);

        // Navigate to stakeholder page
        clickByText(navTab, stakeholders);

        // Verify if the second stakeholder group's name got detached from stakeholder
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("not.contain", updatedStakeholderGroupName);

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that stakeholder got deleted
        notExists(stakeholder.email);

        // Delete first stakeholder group
        stakeholdergroupsList[0].delete();
        cy.wait("@getStakeholdergroups");

        // Assert the deletion of first stakeholder group
        notExists(stakeholdergroupsList[0].name);
    });

    it("Job function attach, update and delete dependency on stakeholder", function () {
        // Create new job function
        const jobfunction = new Jobfunctions(data.getJobTitle());
        jobfunction.create();
        cy.wait("@postJobfunction");
        exists(jobfunction.name);

        // Create new stakeholder and attach the above job function
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName(), jobfunction.name);
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Check if the job function got attached to stakeholder
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .find("td[data-label='Job function']")
            .should("contain", jobfunction.name);

        // Update name of job function
        var updatedJobfunctionName = data.getJobTitle();
        jobfunction.edit(updatedJobfunctionName);
        cy.wait("@getJobfunctions");
        cy.wait(2000);

        // Navigate to stakeholder page
        clickByText(navTab, stakeholders);

        // Verify if the job function's name attached to the stakeholder got updated
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .find("td[data-label='Job function']")
            .should("contain", updatedJobfunctionName);

        // Delete the job function
        jobfunction.delete();
        cy.wait("@getJobfunctions");

        // Assert that job function got deleted
        notExists(jobfunction.name);

        // Navigate to stakeholder page
        clickByText(navTab, stakeholders);

        // Verify if the job function's name got detached from stakeholder
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .find("td[data-label='Job function']")
            .should("not.contain", updatedJobfunctionName);

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that stakeholder got deleted
        notExists(stakeholder.email);
    });
});
