/// <reference types="cypress" />

import { login, click, exists, notExists } from "../../../../utils/utils";
import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag, trTag } from "../../../types/constants";
import { groupsCount } from "../../../views/stakeholders.view";
import { expandRow } from "../../../views/common.view";
import * as data from "../../../../utils/data_utils";

describe("Stakeholder CRUD operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

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
        cy.get(tdTag)
            .contains(stakeholder.email)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdergroupNames[1]);

        // [17 May 2021] : Known bug (https://issues.redhat.com/browse/TACKLE-141), fails the test
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
