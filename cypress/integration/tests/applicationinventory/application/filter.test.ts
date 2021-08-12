/// <reference types="cypress" />

import { login, clickByText, exists, notExists, applySearchFilter } from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import {
    applicationinventory,
    button,
    name,
    clearAllFilters,
    description,
    businessservice,
    tag,
} from "../../../types/constants";

import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { BusinessServices } from "../../../models/businessservices";
import { Tag } from "../../../models/tags";

import * as data from "../../../../utils/data_utils";

var applicationsList: Array<ApplicationInventory> = [];
var businessserviceList: Array<BusinessServices> = [];
var tagList: Array<Tag> = [];
var invalidSearchInput = String(data.getRandomNumber());

describe("Application inventory filter validations", function () {
    before("Login and Create Test Data", function () {
        login();

        for (let i = 0; i < 3; i++) {
            // Create new business service
            const businessService = new BusinessServices(data.getCompanyName());
            businessService.create();

            businessserviceList.push(businessService);
        }

        for (let i = 0; i < 3; i++) {
            // Create new tag
            const newTag = new Tag(data.getRandomWord(6), data.getExistingTagtype());
            newTag.create();

            tagList.push(newTag);
        }

        for (let i = 0; i < 2; i++) {
            // Create new applications
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription(), // refering description value as comment
                businessserviceList[i].name,
                [tagList[i].name]
            );
            application.create();

            applicationsList.push(application);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

        // Interceptors
        cy.intercept("POST", "/api/application-inventory/application*").as("postApplication");
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Delete the business services
        businessserviceList.forEach(function (businessService) {
            businessService.delete();
        });

        // Delete the applications
        tagList.forEach(function (tag) {
            tag.delete();
        });

        // Delete the applications
        applicationsList.forEach(function (application) {
            application.delete();
        });
    });

    it("Name filter validations", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Enter an existing name substring and assert
        var validSearchInput = applicationsList[0].name.substring(0, 11);
        applySearchFilter(name, validSearchInput);
        cy.wait(2000);
        exists(applicationsList[0].name);

        if (applicationsList[1].name.indexOf(validSearchInput) >= 0) {
            exists(applicationsList[1].name);
        }
        clickByText(button, clearAllFilters);

        // Enter an exact existing name and assert
        applySearchFilter(name, applicationsList[1].name);
        cy.wait(2000);
        exists(applicationsList[1].name);

        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Descriptions filter validations", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Enter an existing description substring and assert
        var validSearchInput = applicationsList[0].description.substring(0, 8);
        applySearchFilter(description, validSearchInput);
        cy.wait(2000);
        exists(applicationsList[0].description);

        if (applicationsList[1].description.indexOf(validSearchInput) >= 0) {
            exists(applicationsList[1].description);
        }
        clickByText(button, clearAllFilters);

        // Enter an exact existing description substring and assert
        applySearchFilter(description, applicationsList[1].description);
        cy.wait(2000);
        exists(applicationsList[1].description);

        clickByText(button, clearAllFilters);

        // Enter a non-existing description substring and apply it as search filter
        applySearchFilter(description, invalidSearchInput);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Business service filter validations", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Enter an existing businessservice and assert
        var validSearchInput = applicationsList[0].business;
        applySearchFilter(businessservice, validSearchInput);
        cy.wait(2000);
        exists(applicationsList[0].business);

        clickByText(button, clearAllFilters);

        // Enter a non-existing business service and apply it as search filter
        applySearchFilter(businessservice, businessserviceList[2].name);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Tag filter validations", function () {
        clickByText(navMenu, applicationinventory);
        cy.wait("@getApplication");

        // Enter an existing tag and assert
        var validSearchInput = applicationsList[0].tags[0];
        applySearchFilter(tag, validSearchInput);
        cy.wait(2000);

        exists(applicationsList[0].tags[0]);

        clickByText(button, clearAllFilters);

        // Enter a non-existing tag and apply it as search filter
        applySearchFilter(tag, tagList[2].name);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });
});
