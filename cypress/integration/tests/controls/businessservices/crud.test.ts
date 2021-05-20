/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { BusinessServices } from "../../../models/businessservices";
import * as data from "../../../../utils/data_utils";

describe("A single Business service", () => {
    const businessService = new BusinessServices(data.getCompanyName(), data.getSentence());

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/business-service*").as("postBusinessService");
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");
    });

    it("Business service crud operations", function () {
        // Create new Business service
        businessService.create();
        cy.wait("@postBusinessService");

        // Edit Business service's name
        var updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        cy.wait("@getBusinessService");

        // Delete Business service
        businessService.delete();
        cy.wait("@getBusinessService");

        // Assert that Business service is deleted
        businessService.notExists();
    });
});
