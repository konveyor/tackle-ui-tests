/// <reference types="cypress" />

import { exists, login, notExists } from "../../../../utils/utils";
import { BusinessServices } from "../../../models/businessservices";
import * as data from "../../../../utils/data_utils";

describe("Business service CRUD", () => {
    const businessService = new BusinessServices(data.getCompanyName(), data.getDescription());

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/business-service*").as("postBusinessService");
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");
    });

    it("Business service CRUD operations", function () {
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
});
