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
import {
    click,
    clickByText,
    createMultipleStakeholders,
    exists,
    login,
    notExists,
    selectItemsPerPage,
} from "../../../../../utils/utils";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { stakeholderGroups, tdTag, trTag } from "../../../../types/constants";
import { expandRow } from "../../../../views/common.view";
import { navTab } from "../../../../views/menu.view";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

let stakeholdersList: Array<Stakeholders> = [];
const membersList: Array<string> = [];

describe(["@tier3"], "Stakeholder group linked to stakeholder members", () => {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        stakeholdersList = createMultipleStakeholders(2);
        for (let i = 0; i < stakeholdersList.length; i++) {
            membersList.push(stakeholdersList[i].name);
        }
    });

    beforeEach("Interceptors", function () {
        // Interceptors for stakeholder groups
        cy.intercept("POST", "/hub/stakeholdergroups*").as("postStakeholdergroups");
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholderGroups");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    it("stakeholders attach, update and delete dependency on stakeholder group", function () {
        const stakeholderGroup = new Stakeholdergroups(
            data.getCompanyName(),
            data.getDescription(),
            membersList
        );
        stakeholderGroup.create();
        cy.wait("@postStakeholdergroups");
        exists(stakeholderGroup.name);

        // Check if two stakeholder members attached to stakeholder group
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.contains(tdTag, stakeholderGroup.name)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", membersList[0])
            .and("contain", membersList[1]);

        // Update name of second stakeholder
        const updatedStakeholderName = data.getFullName();
        stakeholdersList[1].edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");

        // Update name of stakeholder group
        const updatedStakeholderGroupName = data.getFullName();
        stakeholderGroup.edit({ name: updatedStakeholderGroupName });
        cy.wait("@getStakeholderGroups");

        clickByText(navTab, stakeholderGroups);
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.contains(tdTag, stakeholderGroup.name)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("contain", updatedStakeholderName);

        stakeholdersList[1].delete();
        cy.wait("@getStakeholders");
        notExists(stakeholdersList[1].name, stakeHoldersTable);
        clickByText(navTab, stakeholderGroups);
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.contains(tdTag, stakeholderGroup.name)
            .parent(trTag)
            .within(() => {
                click(expandRow);
            })
            .get("div > dd")
            .should("not.contain", updatedStakeholderName);

        stakeholderGroup.delete();
        cy.wait("@getStakeholderGroups");
        notExists(stakeholderGroup.name);

        stakeholdersList[0].delete();
        cy.wait("@getStakeholders");
        notExists(stakeholdersList[0].name, stakeHoldersTable);
    });
});
