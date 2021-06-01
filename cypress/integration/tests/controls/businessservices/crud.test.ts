/// <reference types="cypress" />

import { exists, login, notExists } from "../../../../utils/utils";
import { BusinessServices } from "../../../models/businessservices";
import { Stakeholders } from "../../../models/stakeholders";

import * as data from "../../../../utils/data_utils";

describe("Business service CRUD operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors for business services
        cy.intercept("POST", "/api/controls/business-service*").as("postBusinessService");
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");

        // Interceptors for stakeholders
        cy.intercept("POST", "/api/controls/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/api/controls/stakeholder*").as("getStakeholders");
    });

    it("Business service CRUD", function () {
        const businessService = new BusinessServices(data.getCompanyName(), data.getDescription());

        // Create new Business service
        businessService.create();
        cy.wait("@postBusinessService");
        exists(businessService.name);

        // Edit Business service's name
        var updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        cy.wait("@getBusinessService");
        exists(updatedBusinessServiceName);

        // Delete Business service
        businessService.delete();
        cy.wait("@getBusinessService");

        // Assert that Business service is deleted
        notExists(businessService.name);
    });

    it("Business service CRUD with owner", function () {
        // Create owner - stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait("@postStakeholder");

        // Create new Business service with owner attached
        const businessService = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );
        businessService.create();
        cy.wait("@postBusinessService");
        exists(businessService.name);

        // Edit Business service's name
        var updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        cy.wait("@getBusinessService");
        exists(updatedBusinessServiceName);

        // Delete Business service
        businessService.delete();
        cy.wait("@getBusinessService");

        // Assert that Business service is deleted
        notExists(businessService.name);

        // Delete stakeholder owner
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that stakeholder owner is deleted
        notExists(stakeholder.name);
    });
});
