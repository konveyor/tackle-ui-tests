/// <reference types="cypress" />

import { exists, login, notExists } from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import * as data from "../../../../utils/data_utils";

describe("Application crud operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/application-inventory/application*").as("postApplication");
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    it("Application crud", function () {
        const application = new ApplicationInventory(
            data.getFullName(),
            data.getDescription(),
            data.getDescription() // refering description value as comment
        );

        // Create new application
        application.create();
        exists(application.name);
        cy.wait("@postApplication");

        // Edit application's name
        var updatedApplicationName = data.getFullName();
        application.edit({ name: updatedApplicationName });
        exists(updatedApplicationName);
        cy.wait("@getApplication");

        // Delete application
        application.delete();
        cy.wait("@getApplication");

        // Assert that newly created application is deleted
        notExists(application.name);
    });
});
