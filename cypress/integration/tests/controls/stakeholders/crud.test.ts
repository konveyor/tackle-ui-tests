/// <reference types="cypress" />

import { login, click } from "../../../../utils/utils";
import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag, trTag } from "../../../types/constants";
import { groupsCount } from "../../../views/stakeholders.view";
import { expandRow } from "../../../views/commoncontrols.view";
import * as data from "../../../../utils/data_utils";

describe("Stakeholder CRUD operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
        cy.intercept("PUT", "/api/controls/stakeholder/*").as("putStakeholder");
    });

    it("Stakeholder crud operations", function () {
        const stakeholder = new Stakeholders(data.getStakeholderEmail(), data.getStakeholderName());
        // Create new stakeholder
        stakeholder.create();
        cy.wait("@postStakeholder");
        stakeholder.exists();

        // Edit stakeholder name
        var updatedStakeholderName = data.getStakeholderName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");

        // Assert that stakeholder name got edited
        cy.get(tdTag).should("contain", updatedStakeholderName);

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        stakeholder.notExists();
    });

    it("Stakeholder crud cancel", function () {
        const stakeholder = new Stakeholders(data.getStakeholderEmail(), data.getStakeholderName());
        // Cancel the Create new stakeholder task
        stakeholder.create(true);
        stakeholder.notExists();

        // Create new stakeholder for edit and delete cancel verification purpose
        stakeholder.create();
        cy.wait("@postStakeholder");
        stakeholder.exists();

        // Cancel the Edit stakeholder task
        stakeholder.edit({}, true);

        // Assert that stakeholder name did not get edited
        cy.get(tdTag).should("contain", stakeholder.name);

        // Cancel the Delete stakeholder task
        stakeholder.delete(true);

        // Assert that stakeholder still exists, as delete was cancelled
        stakeholder.exists();

        // Finally, perform clean up by deleting the stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");
        stakeholder.notExists();
    });

    it("Stakeholder crud operations with members (jobfunction and groups)", function () {
        var jobfunctions: Array<Jobfunctions> = [];
        var stakeholdergroups: Array<Stakeholdergroups> = [];
        var stakeholdergroupNames: Array<string> = [];
        for (let i = 0; i < 2; i++) {
            // Create new job functions
            const jobfunction = new Jobfunctions();
            jobfunction.create();
            jobfunctions.push(jobfunction);

            // Create new stakeholder groups
            const stakeholdergroup = new Stakeholdergroups();
            stakeholdergroup.create();
            stakeholdergroups.push(stakeholdergroup);
            stakeholdergroupNames.push(stakeholdergroup.stakeholdergroupName);
        }

        var stakeholderEmail = data.getStakeholderEmail();
        var stakeholderName = data.getStakeholderName();

        // Create new object for Stakeholder
        const stakeholder = new Stakeholders(
            stakeholderEmail,
            stakeholderName,
            jobfunctions[0].jobfunctionName,
            [stakeholdergroupNames[0]]
        );

        // Create new stakeholder with one of the job function and group created above
        stakeholder.create();
        cy.wait("@postStakeholder");
        stakeholder.exists();

        // Edit stakeholder name, jobfunction and stakeholdergroup (by removing first one and adding second)
        stakeholder.edit({
            name: data.getStakeholderName(),
            jobfunction: jobfunctions[1].jobfunctionName,
            groups: stakeholdergroupNames,
        });
        cy.wait("@putStakeholder");
        cy.wait("@getStakeholders");

        // Assert that edit operation has been done by checking number of groups and added group exists
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdergroupNames[1]);

        // [17 May 2021] : Known bug (https://issues.redhat.com/browse/TACKLE-141), fails the test
        // Assert that previous stakeholder group was removed
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("not.contain", stakeholdergroupNames[0]);

        // Assert that there should be only one member present
        cy.get(tdTag).contains(stakeholder.email).siblings(groupsCount).should("contain", "1");

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        stakeholder.notExists();

        // Delete jobfunctions and groups created at the start of test
        jobfunctions.forEach(function (jobfunction) {
            jobfunction.delete();
        });

        stakeholdergroups.forEach(function (stakeholdergroup) {
            stakeholdergroup.delete();
        });
    });
});
