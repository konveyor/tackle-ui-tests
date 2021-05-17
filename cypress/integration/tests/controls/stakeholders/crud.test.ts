/// <reference types="cypress" />

import { login, click } from "../../../../utils/utils";
import { Stakeholders } from "../../../models/stakeholders";
import { Stakeholdergroups } from "../../../models/stakeholdergroups";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag, trTag } from "../../../types/constants";
import { groupsCount } from "../../../views/stakeholders.view";
import { expandRow } from "../../../views/commoncontrols.view";

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
        stakeholder.edit({ name: stakeholder.getStakeholderName() });
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
            // Create new job functions
            jobfunction.create();
            jobfunctions.push(jobfunction.jobfunctionName);

            // Create new stakeholder groups
            stakeholdergroup.create();
            stakeholdergroups.push(stakeholdergroup.stakeholdergroupName);
        }
        // Create new stakeholder with one of the job function and group created above
        stakeholder.create({ jobfunction: jobfunctions[0], groups: [stakeholdergroups[0]] });
        cy.wait("@postStakeholder");

        // Edit stakeholder name, jobfunction and stakeholdergroup (by removing first one and adding second)
        stakeholder.edit({
            name: stakeholder.getStakeholderName(),
            jobfunction: jobfunctions[1],
            groups: stakeholdergroups,
        });
        cy.wait("@putStakeholder");
        cy.wait("@getStakeholders");

        // Assert that edit operation has been done by checking number of groups and added group exists
        cy.get(tdTag)
            .contains(stakeholder.stakeholderEmail)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholdergroups[1]);

        // [17 May 2021] : Known bug (https://issues.redhat.com/browse/TACKLE-141), will be uncommented, when bug is fixed
        // Assert that previous stakeholder group was removed
        // cy.get(tdTag)
        //   .contains(stakeholder.stakeholderEmail)
        //   .parent(trTag)
        //   .within(() => {
        //     click(expandRow);
        //   })
        //   .get("div > dd")
        //     .should("not.contain", stakeholdergroups[0]);
        // cy.get(tdTag)
        //     .contains(stakeholder.stakeholderEmail)
        //     .siblings(groupsCount)
        //     .should("contain", "1");

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        cy.get(tdTag).should("not.contain", stakeholder.stakeholderEmail);

        // Delete jobfunctions and groups created at the start of test
        for (let i = 0; i < 2; i++) {
            // Delete job functions
            jobfunction.delete({ jobfunctionName: jobfunctions[i] });

            // Delete stakeholder groups
            stakeholdergroup.delete({ name: stakeholdergroups[i] });
        }
    });
});
