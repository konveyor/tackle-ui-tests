/// <reference types="cypress" />

import {
    login,
    exists,
    notExists,
    existsWithinRow,
    expandRowDetails,
    closeRowDetails,
    hasToBeSkipped,
    preservecookies,
} from "../../../../utils/utils";
import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag } from "../../../types/constants";
import { groupsCount } from "../../../views/stakeholders.view";
import * as data from "../../../../utils/data_utils";

describe("Stakeholder CRUD operations", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
        cy.intercept("PUT", "/api/controls/stakeholder/*").as("putStakeholder");
        cy.intercept("DELETE", "/api/controls/stakeholder/*").as("deleteStakeholder");
    });

    it("Stakeholder CRUD", function () {
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        // Create new stakeholder
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Edit the current stakeholder's name
        var updatedStakeholderName = data.getFullName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@putStakeholder");
        cy.wait("@getStakeholders");

        // Assert that stakeholder name got edited
        exists(updatedStakeholderName);

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        notExists(stakeholder.email);
    });

    it("Stakeholder CRUD cancel", function () {
        var initialStakeholderName = data.getFullName();
        const stakeholder = new Stakeholders(data.getEmail(), initialStakeholderName);
        // Cancel the Create new stakeholder task
        stakeholder.create(true);
        notExists(stakeholder.email);

        // Create new stakeholder for edit and delete cancel verification purpose
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Cancel the Edit stakeholder task
        stakeholder.edit({}, true);

        // Assert that stakeholder name did not get edited
        exists(initialStakeholderName);

        // Cancel the Delete stakeholder task
        stakeholder.delete(true);

        // Assert that stakeholder still exists, as delete was cancelled
        exists(stakeholder.email);

        // Finally, perform clean up by deleting the stakeholder
        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");
        notExists(stakeholder.email);
    });

    it("Stakeholder CRUD operations with members (jobfunction and groups)", function () {
        var jobfunctions: Array<Jobfunctions> = [];
        var stakeholdergroups: Array<Stakeholdergroups> = [];
        var stakeholdergroupNames: Array<string> = [];
        for (let i = 0; i < 2; i++) {
            // Create new job functions
            const jobfunction = new Jobfunctions(data.getJobTitle());
            jobfunction.create();
            jobfunctions.push(jobfunction);

            // Create new stakeholder groups
            const stakeholdergroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription()
            );
            stakeholdergroup.create();
            stakeholdergroups.push(stakeholdergroup);
            stakeholdergroupNames.push(stakeholdergroup.name);
        }

        // Create new object for stakeholder
        const stakeholder = new Stakeholders(
            data.getEmail(),
            data.getFullName(),
            jobfunctions[0].name,
            [stakeholdergroupNames[0]]
        );

        // Create new stakeholder with one of the job function and group created above
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Edit the current stakeholder's name, jobfunction and stakeholder group (by removing first one and adding second)
        stakeholder.edit({
            name: data.getFullName(),
            jobfunction: jobfunctions[1].name,
            groups: stakeholdergroupNames,
        });
        cy.wait("@putStakeholder");
        cy.wait("@getStakeholders");

        // Assert that edit operation has been done by checking number of groups and added group exists
        expandRowDetails(stakeholder.email);
        existsWithinRow(stakeholder.email, "div > dd", stakeholdergroupNames[1]);
        closeRowDetails(stakeholder.email);

        // Assert that previous stakeholder group was removed and only one member is present
        cy.get(tdTag).contains(stakeholder.email).siblings(groupsCount).should("contain", "1");

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        notExists(stakeholder.email);

        // Perform clean up by deleting jobfunctions and groups created at the start of test
        jobfunctions.forEach(function (jobfunction) {
            jobfunction.delete();
        });
        stakeholdergroups.forEach(function (stakeholdergroup) {
            stakeholdergroup.delete();
        });
    });
});
