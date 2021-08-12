/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { Tag } from "../../../models/tags";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { Stakeholders } from "../../../models/stakeholders";
import * as data from "../../../../utils/data_utils";
import { BusinessServices } from "../../../models/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersNameList: Array<string> = [];
var businessservicesList: Array<BusinessServices> = [];
var tagList: Array<Tag> = [];
var applicationList: Array<ApplicationInventory> = [];

describe("Load testing", () => {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple bussiness services and tags
        for (let i = 0; i < 100; i++) {
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();
            stakeholdersList.push(stakeholder);
            stakeholdersNameList.push(stakeholder.name);
        }

        // Create new business service
        for (let j = 0; j < 100; j++) {
            const businessservice = new BusinessServices(
                data.getCompanyName(),
                data.getDescription(),
                stakeholdersList[j].name
            );
            businessservice.create();
            businessservicesList.push(businessservice);
        }

        // Create new tag
        for (let k = 0; k < 100; k++) {
            const tag = new Tag(data.getRandomWord(6), data.getExistingTagtype());
            tag.create();
            tagList.push(tag);
        }

        // Navigate to application inventory tab and create new application
        for (let l = 0; l < 100; l++) {
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription(),
                businessservicesList[l].name,
                [tagList[l].name]
            );
            application.create();
            applicationList.push(application);
            cy.wait(2000);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");

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

    it("Assess and Review all applications", function () {
        for (let i = 0; i < 100; i++) {
            // Perform assessment of application
            applicationList[i].perform_assessment("high", stakeholdersNameList);
            cy.wait(2000);
            applicationList[i].is_assessed();

            // Perform application review
            applicationList[i].perform_review("high");
            cy.wait(2000);
            applicationList[i].is_reviewed();
        }
    });
});
