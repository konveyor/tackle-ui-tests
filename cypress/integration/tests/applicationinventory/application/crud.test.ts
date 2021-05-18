/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";

describe("A single Application", () => {
    const application = new ApplicationInventory();

    beforeEach("Login", function () {
        // Perform login
        login();
    });

    it("Application crud operations", function () {
        // Create new application
        application.create();

        // // Assert if newly create application exists
        application.exists();

        // // Edit application's name
        application.edit({ name: application.getApplicationName() });

        // Delete application
        application.delete();

        // Assert that newly created application is deleted
        application.notExists();
    });
});
