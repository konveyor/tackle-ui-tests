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

import * as data from "../../../../../utils/data_utils";
import { exists, expandRowDetails, notExists } from "../../../../../utils/utils";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

describe(["@tier2"], "Stakeholder group CRUD operations", () => {
    const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());

    beforeEach("Interceptors", function () {
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholdergroups");
    });

    it("Stakeholder group CRUD", function () {
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription()
        );
        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);
        var updateStakeholdergroupName = data.getCompanyName();
        stakeholdergroup.edit({ name: updateStakeholdergroupName });
        cy.wait("@getStakeholdergroups");
        exists(updateStakeholdergroupName);

        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");
        notExists(stakeholdergroup.name);
    });

    it("Stakeholder group CRUD with stakeholder member attached", function () {
        stakeholder.create();
        exists(stakeholder.email, stakeHoldersTable);
        var memberStakeholderName = stakeholder.name;
        const stakeholdergroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            [memberStakeholderName]
        );

        stakeholdergroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholdergroup.name);
        expandRowDetails(stakeholdergroup.name);
        exists(memberStakeholderName);

        stakeholdergroup.edit({
            name: data.getCompanyName(),
            description: data.getDescription(),
            members: [memberStakeholderName],
        });
        cy.wait("@getStakeholdergroups");
        expandRowDetails(stakeholdergroup.name);
        notExists(memberStakeholderName);

        stakeholdergroup.delete();
        cy.wait("@getStakeholdergroups");

        notExists(stakeholdergroup.name);
        stakeholder.delete();
        notExists(stakeholder.email, stakeHoldersTable);
    });
});
