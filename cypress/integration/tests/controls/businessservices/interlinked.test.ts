/// <reference types="cypress" />

import {
    login,
    selectItemsPerPage,
    clickByText,
    exists,
    notExists,
    hasToBeSkipped,
} from "../../../../utils/utils";
import { navTab } from "../../../views/menu.view";
import { BusinessServices } from "../../../models/businessservices";
import { Stakeholders } from "../../../models/stakeholders";
import { tdTag, businessservices } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";

describe("Business service linked to stakeholder", { tags: "@tier1" }, () => {
    beforeEach("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Interceptors for business services
        cy.intercept("POST", "/api/controls/business-service*").as("postBusinessService");
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");

        // Interceptors for stakeholders
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    it("stakeholder attach, update and delete dependency on business service", function () {
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
        clickByText(navTab, businessservices);

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
        clickByText(navTab, businessservices);

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
