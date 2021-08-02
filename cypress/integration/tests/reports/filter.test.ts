/// <reference types="cypress" />

import { login, clickByText, applySearchFilter, getTableColumnData } from "../../../utils/utils";
import { navMenu } from "../../views/menu.view";
import {
    reports,
    name,
    description,
    businessservice,
    tag,
    button,
    clearAllFilters,
} from "../../types/constants";
import { adoptionCandidateDistributionTable } from "../../views/reports.view";
import { ApplicationInventory } from "../../models/applicationinventory/applicationinventory";
import * as data from "../../../utils/data_utils";
import { BusinessServices } from "../../models/businessservices";
import {
    selectItemsPerPageAdoptionCandidate,
    selectItemsPerPageIdentifiedRisks,
    expandArticle,
} from "../../models/reports/reports";
import { Tag } from "../../models/tags";
import { Stakeholders } from "../../models/stakeholders";

var applicationsList: Array<ApplicationInventory> = [];
var businessServiceList: Array<BusinessServices> = [];
var stakeholdersList: Array<Stakeholders> = [];
var tagList: Array<Tag> = [];

describe("Reports filter validations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        stakeholdersList.push(stakeholder);

        // Create new business services
        for (let i = 0; i < 2; i++) {
            const businessservice = new BusinessServices(data.getCompanyName());
            businessservice.create();
            businessServiceList.push(businessservice);
        }

        // Create new tags
        for (let i = 0; i < 3; i++) {
            const newTag = new Tag(data.getRandomWord(6), data.getExistingTagtype());
            newTag.create();
            tagList.push(newTag);
        }

        for (let i = 0; i < 2; i++) {
            const application = new ApplicationInventory(
                data.getAppName(),
                data.getDescription(),
                data.getDescription(), // refering description value as comment
                businessServiceList[i].name,
                [tagList[i].name]
            );

            // Create a new application
            application.create();
            applicationsList.push(application);
        }
        for (let i = 0; i < 1; i++) {
            // Perform assessment of application
            applicationsList[i].perform_assessment("high", [stakeholder.name]);
            cy.wait(4000);
            applicationsList[i].is_assessed();
            cy.wait(4000);
            // Perform application review
            applicationsList[i].perform_review("high");
            cy.wait(4000);
            applicationsList[i].is_reviewed();
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        Cypress.Cookies.preserveOnce("AUTH_SESSION_ID", "KEYCLOAK_SESSION");
    });

    after("Perform test data clean up", function () {
        // Delete the stakeholder
        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });

        // Delete the business services
        businessServiceList.forEach(function (businessService) {
            businessService.delete();
        });

        // Delete the tags
        tagList.forEach(function (tag) {
            tag.delete();
        });

        // Delete the applications
        applicationsList.forEach(function (application) {
            application.delete();
        });
    });

    it("Name field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Enter an existing application name substring and apply it as search filter
        var validSearchInput = applicationsList[0].name;

        applySearchFilter(name, validSearchInput);
        cy.wait(3000);

        // Check element filterd for table Adoption Candidate Distribution
        selectItemsPerPageAdoptionCandidate(100);

        // Wait for DOM to render table and sibling elements
        cy.get(adoptionCandidateDistributionTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get("td").should("contain", applicationsList[0].name);
                }
            });

        // Check element filtered for table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(validSearchInput).to.equal(application);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Description field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Enter an existing application description substring and apply it as search filter
        var validSearchInput = applicationsList[0].description;
        applySearchFilter(description, validSearchInput);
        cy.wait(3000);

        // Check element filtered for table Adoption Candidate Distribution
        selectItemsPerPageAdoptionCandidate(100);

        // Wait for DOM to render table and sibling elements
        cy.get(adoptionCandidateDistributionTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get("td").should("contain", applicationsList[0].name);
                }
            });

        // Check element filtered for table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(validSearchInput).to.equal(application);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Business service field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // select an existing application business service and apply it as search filter
        var validSearchInput = applicationsList[0].business;
        applySearchFilter(businessservice, validSearchInput);
        cy.wait(3000);

        // Check element filtered for table Adoption Candidate Distribution
        selectItemsPerPageAdoptionCandidate(100);

        // Wait for DOM to render table and sibling elements
        cy.get(adoptionCandidateDistributionTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get("td").should("contain", applicationsList[0].name);
                }
            });

        // Check element filtered for table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(applicationsList[0].name).to.equal(application);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Tag field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // select an existing application tag and apply it as search filter
        var validSearchInput = applicationsList[0].tags[0];
        applySearchFilter(tag, validSearchInput);
        cy.wait(3000);

        // Check element filtered for table Adoption Candidate Distribution
        selectItemsPerPageAdoptionCandidate(100);

        // Wait for DOM to render table and sibling elements
        cy.get(adoptionCandidateDistributionTable)
            .next()
            .then(($div) => {
                if (!$div.hasClass("pf-c-empty-state")) {
                    cy.get("td").should("contain", applicationsList[0].name);
                }
            });

        // Check element filtered for table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(applicationsList[0].name).to.equal(application);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);
    });
});
