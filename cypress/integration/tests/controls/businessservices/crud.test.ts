/// <reference types="cypress" />

import {
    exists,
    hasToBeSkipped,
    login,
    notExists,
    preservecookies,
    selectUserPerspective
} from "../../../../utils/utils";
import { BusinessServices } from "../../../models/businessservices";
import { Stakeholders } from "../../../models/stakeholders";

import * as data from "../../../../utils/data_utils";

describe("Business service CRUD operations", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors for business services
        cy.intercept("POST", "/hub/businessservices*").as("postBusinessService");
        cy.intercept("GET", "/hub/businessservices*").as("getBusinessService");

        // Interceptors for stakeholders
        cy.intercept("POST", "/hub/stakeholders*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholders*").as("getStakeholders");
    });

    it("Business service CRUD", function () {
        const businessService = new BusinessServices(data.getCompanyName(), data.getDescription());

        selectUserPerspective("Developer");

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

    it("Business service CRUD with owner", function () {

        selectUserPerspective("Developer");

        // Create owner - stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait("@postStakeholder");

        // Create new Business service with owner attached
        const businessService = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );
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

        // Delete stakeholder owner
        stakeholder.delete();
        cy.wait("@getStakeholders");

        // Assert that stakeholder owner is deleted
        notExists(stakeholder.email);
    });
});
