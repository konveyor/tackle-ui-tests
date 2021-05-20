/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import * as data from "../../../../utils/data_utils";

describe("A single Application", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/application-inventory/application*").as("postApplication");
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    it("Application crud operations", function () {
        const application = new ApplicationInventory(
            data.getName(),
            data.getDescription(),
            data.getComment()
        );

        // Create new application
        application.create();
        cy.wait("@postApplication");

        // Edit application's name
        var updateApplicationName = data.getName();
        application.edit({ name: updateApplicationName });
        cy.wait("@getApplication");

        // Delete application
        application.delete();
        cy.wait("@getApplication");

        // Assert that newly created application is deleted
        application.notExists();
    });
});
