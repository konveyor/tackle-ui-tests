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
    clickByText,
    exists,
    login,
    notExists,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { businessServices, migration, SEC, tdTag } from "../../../../types/constants";
import { navTab } from "../../../../views/menu.view";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

describe(["@tier3"], "Business service linked to stakeholder", () => {
    beforeEach("Login", function () {
        login();

        // Interceptors for business services
        cy.intercept("POST", "/hub/business-service*").as("postBusinessService");
        cy.intercept("GET", "/hub/business-service*").as("getBusinessService");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    it("Stakeholder attach, update and delete dependency on business service", function () {
        selectUserPerspective(migration);

        // Create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait("@postStakeholder");

        // Create new business service and attach a stakeholder
        const businessservice = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );
        businessservice.create();
        cy.get("@postBusinessService");
        exists(businessservice.name);

        // Verify stakeholder attached to business service
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(businessservice.name)
            .get("td[data-label='Owner']")
            .should("contain", stakeholder.name);

        // Update name of stakeholder
        var updatedStakeholderName = data.getFullName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");
        cy.wait(2 * SEC);

        // Go to business services page
        clickByText(navTab, businessServices);

        // Verify stakeholder's name attached to business service updated
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(businessservice.name)
            .get("td[data-label='Owner']")
            .should("contain", updatedStakeholderName);

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@getStakeholders");
        // Assert that stakeholder deleted
        notExists(stakeholder.name, stakeHoldersTable);

        // Go to business services page
        clickByText(navTab, businessServices);

        // Verify stakeholder's name detached from business services
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(businessservice.name)
            .get("td[data-label='Owner']")
            .should("not.contain", updatedStakeholderName);

        // Delete business service
        businessservice.delete();
        cy.get("@getBusinessService");

        // Assert that created business service is deleted
        notExists(businessservice.name);
    });
});
