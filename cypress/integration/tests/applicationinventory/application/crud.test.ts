/// <reference types="cypress" />

import { exists, hasToBeSkipped, login, notExists } from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import * as data from "../../../../utils/data_utils";

describe("Application crud operations", { tags: "@tier1" }, () => {
    beforeEach("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Application crud", function () {
        const application = new ApplicationInventory(
            data.getAppName(),
            data.getDescription(),
            data.getDescription() // refering description value as comment
        );

        // Create new application
        application.create();
        exists(application.name);
        cy.wait("@postApplication");

        // Edit application's name
        var updatedApplicationName = data.getAppName();
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
