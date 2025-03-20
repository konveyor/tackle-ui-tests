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
} from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { businessServices, SEC, tdTag } from "../../../../types/constants";
import { navTab } from "../../../../views/menu.view";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

describe(["@tier3"], "Business service linked to stakeholder", () => {
    beforeEach("Login", function () {

        // Interceptors for business services
        cy.intercept("POST", "/hub/business-service*").as("postBusinessService");
        cy.intercept("GET", "/hub/business-service*").as("getBusinessService");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
    });

    it("Stakeholder attach, update and delete dependency on business service", function () {
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait("@postStakeholder");

        const businessservice = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );
        businessservice.create();
        cy.get("@postBusinessService");
        exists(businessservice.name);

        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(businessservice.name)
            .get("td[data-label='Owner']")
            .should("contain", stakeholder.name);

        var updatedStakeholderName = data.getFullName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");
        cy.wait(2 * SEC);
        clickByText(navTab, businessServices);
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(businessservice.name)
            .get("td[data-label='Owner']")
            .should("contain", updatedStakeholderName);
        stakeholder.delete();
        cy.wait("@getStakeholders");
        notExists(stakeholder.name, stakeHoldersTable);

        clickByText(navTab, businessServices);
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(businessservice.name)
            .get("td[data-label='Owner']")
            .should("not.contain", updatedStakeholderName);
        businessservice.delete();
        cy.get("@getBusinessService");
        notExists(businessservice.name);
    });
});
