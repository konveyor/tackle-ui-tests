/// <reference types="cypress" />

import { login, clickByText, notExists, preservecookies } from "../../../../utils/utils";
import { Tag } from "../../../models/tags";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { businessColumnSelector } from "../../../views/applicationinventory.view";
import { navMenu } from "../../../views/menu.view";
import { navTab } from "../../../views/menu.view";
import { Stakeholders } from "../../../models/stakeholders";

import { applicationinventory, controls, businessservices, tags } from "../../../types/constants";

import * as data from "../../../../utils/data_utils";
import { BusinessServices } from "../../../models/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var businessservicesList: Array<BusinessServices> = [];
var tagList: Array<Tag> = [];
var applicationList: Array<ApplicationInventory> = [];

describe("Application inventory interlinked to tags and business service", () => {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple bussiness services and tags
        for (let i = 0; i < 2; i++) {
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();
            stakeholdersList.push(stakeholder);

            // Create new business service
            const businessservice = new BusinessServices(
                data.getCompanyName(),
                data.getDescription(),
                stakeholder.name
            );
            businessservice.create();
            businessservicesList.push(businessservice);

            // Create new tag
            const tag = new Tag(data.getRandomWord(6), data.getExistingTagtype());
            tag.create();
            tagList.push(tag);

            // Navigate to application inventory tab and create new application
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription(),
                businessservice.name,
                [tag.name]
            );
            application.create();
            applicationList.push(application);
            cy.wait(2000);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/api/controls/business-service*").as("postBusinessService");
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");

        // Interceptors
        cy.intercept("POST", "/api/controls/tag*").as("postTag");
        cy.intercept("GET", "/api/controls/tag*").as("getTag");

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Delete the applications and stakeholders created before the tests
        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });

        // Delete application
        applicationList.forEach(function (application) {
            application.delete();
        });
        // Clean up business service and tags
        businessservicesList[1].delete();
        tagList[1].delete();
    });

    it("Business Service update and delete dependency on application inventory", function () {
        // Navigate to Business Service and delete
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);

        //Delete associated business service
        businessservicesList[0].delete();
        notExists(businessservicesList[0].name);

        // Navigate to tags and delete
        clickByText(navTab, tags);
        tagList[0].delete();

        // Navigate to application inventory
        clickByText(navMenu, applicationinventory);
        cy.wait(100);
        cy.wait("@getApplication");

        // Assert that deleted business service is removed from application
        applicationList[0].getColumnText(businessColumnSelector, "Not available");
        cy.wait(100);

        // Assert that deleted tag is removed
        applicationList[0].expandApplicationRow();
        applicationList[0].existsWithinRow(applicationList[0].name, "Tags", "Unknown");
        applicationList[0].closeApplicationRow();

        applicationList[0].edit({
            business: businessservicesList[1].name,
            tags: [tagList[1].name],
        });
        cy.wait("@getApplication");

        // Assert that business service is updated
        applicationList[0].getColumnText(businessColumnSelector, businessservicesList[1].name);
        cy.wait(100);

        // Assert that created tag exists
        applicationList[0].expandApplicationRow();
        applicationList[0].existsWithinRow(applicationList[0].name, "Tags", tagList[1].name);
        applicationList[0].closeApplicationRow();
    });
});
