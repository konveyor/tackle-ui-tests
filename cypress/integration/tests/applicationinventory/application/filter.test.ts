/// <reference types="cypress" />

import {
    login,
    clickByText,
    exists,
    preservecookies,
    applySearchFilter,
    hasToBeSkipped,
    createMultipleBusinessServices,
    createMultipleTags,
    createMultipleApplications,
    deleteAllBusinessServices,
    deleteAllTagTypes,
    deleteApplicationTableRows,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import {
    applicationInventory,
    button,
    name,
    clearAllFilters,
    description,
    businessService,
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

describe("Application inventory filter validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        businessserviceList = createMultipleBusinessServices(3);
        tagList = createMultipleTags(3);
        applicationsList = createMultipleApplications(2, businessserviceList, tagList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/api/application-inventory/application*").as("postApplication");
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier2")) return;

        // Delete the business services
        deleteAllBusinessServices();

        deleteAllTagTypes();
        deleteApplicationTableRows();
    });

    it("Name filter validations", function () {
        clickByText(navMenu, applicationInventory);
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
        clickByText(navMenu, applicationInventory);
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
        clickByText(navMenu, applicationInventory);
        cy.wait("@getApplication");

        // Enter an existing businessservice and assert
        var validSearchInput = applicationsList[0].business;
        applySearchFilter(businessService, validSearchInput);
        cy.wait(2000);
        exists(applicationsList[0].business);

        clickByText(button, clearAllFilters);

        // Enter a non-existing business service and apply it as search filter
        applySearchFilter(businessService, businessserviceList[2].name);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Tag filter validations", function () {
        clickByText(navMenu, applicationInventory);
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
