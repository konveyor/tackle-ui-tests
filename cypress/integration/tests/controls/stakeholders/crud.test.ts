/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag } from "../../../types/constants";
import { groupsCount } from "../../../views/stakeholders.view";

describe("Stakeholder CRUD operations", () => {
    const stakeholder = new Stakeholders();
    const stakeholdergroup = new Stakeholdergroups();
    const jobfunction = new Jobfunctions();

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
        cy.intercept("PUT", "/api/controls/stakeholder/*").as("putStakeholder");
    });

    it("Stakeholder crud operations", function () {
        // Create new stakeholder
        stakeholder.create();
        cy.wait("@postStakeholder");

        // Edit stakeholder name
        stakeholder.edit();
        cy.wait("@getStakeholders");

        // Assert that stakeholder name got edited
        cy.get(tdTag).should("contain", stakeholder.stakeholderName);

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        cy.get(tdTag).should("not.contain", stakeholder.stakeholderEmail);
    });

    it("Stakeholder crud operations with members (jobfunction and groups)", function () {
        var jobfunctions: Array<string> = [];
        var stakeholdergroups: Array<string> = [];
        for (let i = 0; i < 2; i++) {
            // Create job functions
            jobfunction.create();
            jobfunctions.push(jobfunction.jobfunctionName);

            // Create new stakeholder groups
            stakeholdergroup.create();
            stakeholdergroups.push(stakeholdergroup.stakeholdergroupName);
        }
        // Create stakeholder with above members
        stakeholder.create(jobfunctions[0], [stakeholdergroups[0]]);
        cy.wait("@postStakeholder");

        // Edit stakeholder
        stakeholder.edit(jobfunctions[1], [stakeholdergroups[1]], [stakeholdergroups[0]]);
        cy.wait("@putStakeholder");
        cy.wait("@getStakeholders");

        // Assert that edit operation has been done by checking number of groups
        //cy.get(tdTag).contains(stakeholder.stakeholderEmail).siblings(groupsCount).should("contain", "1");

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        cy.get(tdTag).should("not.contain", stakeholder.stakeholderEmail);

        // Delete jobfunctions and groups created at the start of test
        for (let i = 0; i < 2; i++) {
            // Delete job functions
            jobfunction.delete(jobfunctions[i]);

            // Delete stakeholder groups
            stakeholdergroup.delete(stakeholdergroups[i]);
        }
    });
});
