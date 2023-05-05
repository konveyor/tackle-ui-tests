/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    login,
    selectItemsPerPage,
    click,
    clickByText,
    exists,
    notExists,
    preservecookies,
    hasToBeSkipped,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { navTab } from "../../../../views/menu.view";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import { tdTag, trTag, stakeholders, migration } from "../../../../types/constants";
import { expandRow } from "../../../../views/common.view";
import * as data from "../../../../../utils/data_utils";

var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var stakeholdergroupNames: Array<string> = [];

describe(["@tier1"], "Stakeholder linked to stakeholder groups and job function", () => {
    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for stakeholder groups
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholdergroups");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");

        // Interceptors for job functions
        cy.intercept("POST", "/hub/jobfunctions*").as("postJobfunction");
        cy.intercept("GET", "/hub/jobfunctions*").as("getJobfunctions");
    });

    it("Stakeholder group attach, update and delete dependency on stakeholder", function () {
        selectUserPerspective(migration);

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
        selectUserPerspective(migration);

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
