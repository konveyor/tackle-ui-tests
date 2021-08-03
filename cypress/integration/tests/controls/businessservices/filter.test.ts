/// <reference types="cypress" />

import { login, clickByText, exists, notExists, applySearchFilter } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    controls,
    businessservices,
    description,
    owner,
    button,
    name,
    clearAllFilters,
} from "../../../types/constants";

import { BusinessServices } from "../../../models/businessservices";
import { Stakeholders } from "../../../models/stakeholders";
import * as data from "../../../../utils/data_utils";

var businessservicesList: Array<BusinessServices> = [];
var stakeholdersList: Array<Stakeholders> = [];
var invalidSearchInput = String(data.getRandomNumber());

describe("Business services filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        // Create multiple stakeholder owners
        for (let i = 0; i < 3; i++) {
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();

            stakeholdersList.push(stakeholder);
        }

        // Create multiple job functions
        for (let i = 0; i < 2; i++) {
            // Create new job function
            const newBusinessservice = new BusinessServices(
                data.getFullName(),
                data.getDescription(),
                stakeholdersList[i].name
            );
            newBusinessservice.create();

            businessservicesList.push(newBusinessservice);
        }
    });

    after("Perform test data clean up", function () {
        // Delete the business services
        businessservicesList.forEach(function (businessservice) {
            businessservice.delete();
        });

        // Delete the stakeholders
        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");
    });

    it("Name filter validations", function () {
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);

        // Enter an existing display name substring and assert
        var validSearchInput = businessservicesList[0].name.substring(0, 3);
        applySearchFilter(name, validSearchInput);
        exists(businessservicesList[0].name);

        if (businessservicesList[1].name.substring(0, 3) == validSearchInput) {
            exists(businessservicesList[1].name);
        } else {
            notExists(businessservicesList[1].name);
        }

        clickByText(button, clearAllFilters);

        // Enter an existing exact name and assert
        applySearchFilter(name, businessservicesList[1].name);
        exists(businessservicesList[1].name);
        notExists(businessservicesList[0].name);

        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });

    it("Description filter validations", function () {
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);

        // Enter an existing description substring and assert
        var validSearchInput = businessservicesList[0].description.substring(0, 8);
        applySearchFilter(description, validSearchInput);
        exists(businessservicesList[0].description);

        if (businessservicesList[1].description.substring(0, 8) == validSearchInput) {
            exists(businessservicesList[1].description);
        } else {
            notExists(businessservicesList[1].description);
        }

        clickByText(button, clearAllFilters);

        // Enter an existing exact description and assert
        applySearchFilter(description, businessservicesList[1].description);
        exists(businessservicesList[1].description);
        notExists(businessservicesList[0].description);

        clickByText(button, clearAllFilters);

        // Enter a non-existing description substring and apply it as search filter
        applySearchFilter(description, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });

    it("Owner filter validations", function () {
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);

        // Enter an existing owner substring and assert
        var validSearchInput = businessservicesList[0].owner.substring(0, 3);
        applySearchFilter(owner, validSearchInput);
        exists(businessservicesList[0].owner);

        if (businessservicesList[1].owner.substring(0, 3) == validSearchInput) {
            exists(businessservicesList[1].owner);
        } else {
            notExists(businessservicesList[1].owner);
        }

        clickByText(button, clearAllFilters);

        // Enter an existing exact owner and assert
        applySearchFilter(owner, businessservicesList[1].owner);
        exists(businessservicesList[1].owner);
        notExists(businessservicesList[0].owner);

        clickByText(button, clearAllFilters);

        // Enter a non-attached owner substring and apply it as search filter
        applySearchFilter(owner, stakeholdersList[2].name);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");
    });
});
