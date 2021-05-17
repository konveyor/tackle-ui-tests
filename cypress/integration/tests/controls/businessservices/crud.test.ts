/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { BusinessServices } from "../../../models/businessservices";
import * as faker from "faker";

describe("A single Business service", () => {
    const businessService = new BusinessServices();

    beforeEach("Login", function () {
        // Perform login
        login();
    });

    it("Business service crud operations", function () {
        // Create new Business service
        businessService.create();

        businessService.exists();

        // Edit Business service's name
        businessService.edit({ name: faker.company.companyName() });

        // Delete Business service
        businessService.delete();

        // Assert that Business service is deleted
        businessService.notExists();
    });
});
