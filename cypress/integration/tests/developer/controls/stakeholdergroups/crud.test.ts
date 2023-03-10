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
    exists,
    notExists,
    hasToBeSkipped,
    preservecookies,
    selectUserPerspective,
    deleteAllStakeholders,
} from "../../../../../utils/utils";
import { Stakeholdergroups } from "../../../../models/developer/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { migration, tdTag, trTag } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { expandRow } from "../../../../views/common.view";

describe("Stakeholder group CRUD operations", { tags: "@tier1" }, () => {
    const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        deleteAllStakeholders();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholdergroups");
    });

    it("Stakeholder group CRUD", function () {
        selectUserPerspective("Migration");

        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription()
        );
        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

        // Edit stakeholder group's name
        var updateStakeholdergroupName = data.getCompanyName();
        stakeholdergroup.edit({ name: updateStakeholdergroupName });
        cy.wait("@getStakeholdergroups");

        // Assert that stakeholder group name got edited
        exists(updateStakeholdergroupName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        notExists(stakeholdergroup.name);
    });

    it("Stakeholder group CRUD with stakeholder member attached", function () {
        selectUserPerspective(migration);

        // Create stakeholder
        stakeholder.create();
        exists(stakeholder.email);
        var memberStakeholderName = stakeholder.name;

        // Create new object of stakeholder group with members
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            [memberStakeholderName]
        );

        // Create new stakeholder group
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);

        // Check if stakeholder member is attached to stakeholder group
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", memberStakeholderName);

        // Edit the current stakeholder group's name, description and member
        stakeholdergroup.edit({
            name: data.getCompanyName(),
            description: data.getDescription(),
            members: [memberStakeholderName],
        });
        cy.wait("@getStakeholdergroups");

        // Check if stakeholder group's member is removed
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroup.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("not.contain", memberStakeholderName);

        // Delete stakeholder group
        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        // Assert that newly created stakeholder group is deleted
        notExists(stakeholdergroup.name);

        // Delete stakeholder
        stakeholder.delete();

        // Assert that created stakeholder is deleted
        notExists(stakeholder.email);
    });
});
