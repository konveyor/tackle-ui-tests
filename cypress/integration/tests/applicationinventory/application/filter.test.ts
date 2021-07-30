/// <reference types="cypress" />

import { login, clickByText, exists, applySearchFilter } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    applicationinventory,
    jobfunctions,
    button,
    name,
    clearAllFilters,
} from "../../../types/constants";

import { Jobfunctions } from "../../../models/jobfunctions";
import * as data from "../../../../utils/data_utils";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { BusinessServices } from "../../../models/businessservices";
var applicationsList: Array<ApplicationInventory> = [];
var invalidSearchInput = String(data.getRandomNumber());

describe("Application inventory filter validations", function () {
    before("Login and Create Test Data", function () {
        login();

        for (let i = 0; i < 2; i++) {
            // Create new business service
            const businessservice = new BusinessServices(data.getCompanyName());
            businessservice.create();

            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription(), // refering description value as comment
                businessservice.name,
                [data.getExistingTagtype()]
            );

            // Create a new application
            application.create();

            applicationsList.push(application);
        }
    });

    after("Perform test data clean up", function () {
        // Delete the job functions
        applicationsList.forEach(function (application) {
            application.delete();
        });
    });

    it("Name filter validations", function () {
        clickByText(navMenu, applicationinventory);

        // Enter an existing name substring and assert
        var validSearchInput = applicationsList[0].name.substring(0, 11);
        applySearchFilter(name, validSearchInput);
        exists(applicationsList[0].name);
        clickByText(button, clearAllFilters);

        applySearchFilter(name, applicationsList[1].name);
        exists(applicationsList[1].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });

    it("Descriptions filter validations", function () {
        clickByText(navMenu, applicationinventory);

        // Enter an existing name substring and assert
        var validSearchInput = applicationsList[0].description.substring(0, 5);
        applySearchFilter(name, validSearchInput);
        exists(applicationsList[0].description);
        clickByText(button, clearAllFilters);

        applySearchFilter(name, applicationsList[1].description);
        exists(applicationsList[1].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });
});
