/// <reference types="cypress" />

import { login, clickByText } from "../../../../utils/utils";
import { Tag } from "../../../models/tags";
import { ApplicationInventory } from "../../../models/applicationinventory/applicationinventory";
import { Stakeholders } from "../../../models/stakeholders";
import * as data from "../../../../utils/data_utils";
import { BusinessServices } from "../../../models/businessservices";
import { applicationinventory} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersNameList: Array<string> = [];
var businessservicesList: Array<BusinessServices> = [];
var tagList: Array<Tag> = [];
var applicationList: Array<ApplicationInventory> = [];

describe("Load testing", () => {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);

        const businessservice = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholdersList[0].name
        );
        businessservice.create();
        businessservicesList.push(businessservice);
    
        const tag = new Tag(data.getRandomWord(6), data.getExistingTagtype());
            tag.create();
            tagList.push(tag);

        // Navigate to application inventory tab and create new application
        for (let l = 0; l < 2; l++) {
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription(),
                businessservicesList[0].name,
                [tagList[0].name]
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

        cy.intercept("POST", "/api/controls/tag*").as("postTag");
        cy.intercept("GET", "/api/controls/tag*").as("getTag");

        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Delete stakeholders created before the tests
        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });
       
        // Clean up business service and tags
        businessservicesList.forEach(function (stakeholder) {
            stakeholder.delete();
        });

        tagList.forEach(function (stakeholder) {
            stakeholder.delete();
        });

        // Delete all applications
        clickByText(navMenu, applicationinventory);
        cy.wait(2000);
        applicationList.forEach(function (application) {
            cy.get(".pf-c-table > tbody > tr")
                .not(".pf-c-table__expandable-row")
                .find("td[data-label=Name]")
                .each(($rows) => {
                    if ($rows.text() === application.name) application.delete();
                });
        });
    });

    it("Assess and Review all applications", function () {
        for (let i = 0; i < 2; i++) {
            // Perform assessment of application
            var risk = data.getRandomRisk()
            applicationList[i].perform_assessment(risk, stakeholdersNameList);
            cy.wait(2000);
            applicationList[i].is_assessed();

            // Perform application review
            applicationList[i].perform_review(risk);
            cy.wait(2000);
            applicationList[i].is_reviewed();
        }
    });
});
