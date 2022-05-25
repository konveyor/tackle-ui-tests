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
    clickByText,
    exists,
    notExists,
    hasToBeSkipped,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { navTab } from "../../../../views/menu.view";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";
import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { tdTag, businessServices } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";

describe("Business service linked to stakeholder", { tags: "@tier1" }, () => {
    beforeEach("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Interceptors for business services
        cy.intercept("POST", "/hub/business-service*").as("postBusinessService");
        cy.intercept("GET", "/hub/business-service*").as("getBusinessService");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    it("stakeholder attach, update and delete dependency on business service", function () {
        selectUserPerspective("Developer");

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
        cy.wait("@postBusinessService");
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
        notExists(stakeholder.name);

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
        cy.wait("@getBusinessService");

        // Assert that created business service is deleted
        notExists(businessservice.name);
    });
});
