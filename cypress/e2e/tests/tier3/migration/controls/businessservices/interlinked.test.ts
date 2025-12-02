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
import { clickByText, exists, notExists, selectItemsPerPage } from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { businessServices, tdTag } from "../../../../types/constants";
import { navTab } from "../../../../views/menu.view";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

describe(["@tier3"], "Business service linked to stakeholder", () => {
    beforeEach("Login", function () {
        cy.intercept("POST", "/hub/businessservices*").as("postBusinessService");
        cy.intercept("GET", "/hub/businessservices*").as("getBusinessServices");

        cy.intercept("POST", "/hub/stakeholders*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholders*").as("getStakeholders");
    });

    it("Stakeholder attach, update and delete dependency on business service", function () {
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait("@postStakeholder");

        const businessService = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );
        businessService.create();
        cy.wait("@postBusinessService");
        exists(businessService.name);

        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(businessService.name)
            .get("td[data-label='Owner']")
            .should("contain", stakeholder.name);

        const updatedStakeholderName = data.getFullName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");

        clickByText(navTab, businessServices);
        selectItemsPerPage(100);
        cy.wait("@getBusinessServices");
        cy.get(tdTag)
            .contains(businessService.name)
            .get("td[data-label='Owner']")
            .should("contain", updatedStakeholderName);
        stakeholder.delete();
        cy.wait("@getStakeholders");
        notExists(stakeholder.name, stakeHoldersTable);

        clickByText(navTab, businessServices);
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(businessService.name)
            .get("td[data-label='Owner']")
            .should("not.contain", updatedStakeholderName);
        businessService.delete();
        cy.wait("@getBusinessServices");
        notExists(businessService.name);
    });
});
