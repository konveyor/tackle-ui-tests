/// <reference types="cypress" />

import {
    login,
    clickByText,
    applySearchFilter,
    getTableColumnData,
    selectFilter,
    preservecookies,
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleBusinessServices,
    createMultipleTags,
    createMultipleApplications,
    deleteAllStakeholders,
    deleteAllBusinessServices,
    deleteAllTagTypes,
    deleteApplicationTableRows,
} from "../../../utils/utils";
import { navMenu } from "../../views/menu.view";
import {
    reports,
    name,
    description,
    businessService,
    tag,
    button,
    clearAllFilters,
    application,
    category,
    question,
    answer,
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
var invalidSearchInput = String(data.getRandomNumber());

describe("Reports filter validations", { tags: "@tier2" }, () => {
    before("Login and create test data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        stakeholdersList = createMultipleStakeholders(1);
        businessServiceList = createMultipleBusinessServices(2);
        tagList = createMultipleTags(3);
        applicationsList = createMultipleApplications(2, businessServiceList, tagList);

        // Perform assessment of application
        applicationsList[0].perform_assessment("high", [stakeholdersList[0].name]);
        cy.wait(4000);
        applicationsList[0].is_assessed();
        cy.wait(4000);
        // Perform application review
        applicationsList[0].perform_review("high");
        cy.wait(4000);
        applicationsList[0].is_reviewed();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Delete the stakeholder
        deleteAllStakeholders();
        deleteAllBusinessServices();
        deleteAllTagTypes();
        deleteApplicationTableRows();
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
            expect(application).to.have.string(validSearchInput);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);

        // Expand article cards
        expandArticle("Identified risks");
        cy.wait(2000);
        expandArticle("Suggested adoption plan");
        cy.wait(2000);

        // Assert that no search results are found
        // Check for current landscape donut charts
        cy.get("div > h2").eq(0).contains("No data available");

        // Check for Adoption candidate distribution table
        cy.get("div > h2").eq(1).contains("No data available");

        // Check for Suggested adoption plan graphs
        cy.get("div > h2").eq(2).contains("No data available");

        // Check for Identified risks table
        cy.get("div > h2").eq(3).contains("No results found");

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
            expect(application).to.have.string(applicationsList[0].name);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(description, invalidSearchInput);

        // Expand article cards
        expandArticle("Identified risks");
        cy.wait(2000);
        expandArticle("Suggested adoption plan");
        cy.wait(2000);

        // Assert that no search results are found
        // Check for current landscape donut charts
        cy.get("div > h2").eq(0).contains("No data available");

        // Check for Adoption candidate distribution table
        cy.get("div > h2").eq(1).contains("No data available");

        // Check for Suggested adoption plan graphs
        cy.get("div > h2").eq(2).contains("No data available");

        // Check for Identified risks table
        cy.get("div > h2").eq(3).contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Business service field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // select an existing application business service and apply it as search filter
        var validSearchInput = applicationsList[0].business;
        applySearchFilter(businessService, validSearchInput);
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
            expect(application).to.have.string(applicationsList[0].name);
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
            expect(application).to.have.string(applicationsList[0].name);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Application field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Workaround for filters - Keeping default filter selected for reports filter
        // if it gets changed to tag/business service due to last test case then
        // eq(1) for identified filter text input does not apply
        selectFilter("Name");

        // Enter an application name and apply it as search filter
        var validSearchInput = applicationsList[0].name.substring(0, 11);

        // Expand table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        applySearchFilter(application, validSearchInput, true);
        cy.wait(3000);

        // Get list of filtered applications rows and varify
        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(application).to.have.string(applicationsList[0].name);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(application, applicationsList[0].name, true);
        cy.wait(3000);

        // Get list of filtered applications rows and varify
        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(application).to.have.string(applicationsList[0].name);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(application, invalidSearchInput, true);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Category field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Expand table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        // Get an category of assessment questions and apply it as search filter
        var categoryString = "Application details";
        var validSearchInput = categoryString.substring(0, 16);

        applySearchFilter(category, validSearchInput, true);
        cy.wait(3000);

        // Get list of filtered category rows and varify
        var categoryData = getTableColumnData("Category");
        cy.wrap(categoryData).each((category) => {
            expect(categoryString.toLowerCase()).to.equal(category);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(category, categoryString, true);
        cy.wait(3000);

        // Get list of filtered category rows and varify
        var categoryData = getTableColumnData("Category");
        cy.wrap(categoryData).each((category) => {
            expect(categoryString.toLowerCase()).to.equal(category);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(category, invalidSearchInput, true);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Question field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Expand table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        // Get a question from assessment question's list and apply it as search filter
        var questionString = "How is the application tested?";
        var validSearchInput = questionString.substring(0, 27);
        applySearchFilter(question, validSearchInput, true);
        cy.wait(3000);

        // Get list of filtered questions rows and varify
        var questionsData = getTableColumnData("Question");
        cy.wrap(questionsData).each((question) => {
            expect(questionString.toLowerCase()).to.equal(question);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(question, questionString, true);
        cy.wait(3000);

        // Get list of filtered questions rows and varify
        var questionsData = getTableColumnData("Question");
        cy.wrap(questionsData).each((question) => {
            expect(questionString.toLowerCase()).to.equal(question);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(question, invalidSearchInput, true);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Answer field validations", function () {
        // Navigate to reports
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Expand table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        // select an answer input from existing answers and apply it as search filter
        var answerString = "Not tracked";
        var validSearchInput = answerString.substring(0, 7);
        applySearchFilter(answer, validSearchInput, true);
        cy.wait(3000);

        // Get list of filtered answers rows and varify
        var answersData = getTableColumnData("Answer");
        cy.wrap(answersData).each((answer) => {
            expect(answerString.toLowerCase()).to.equal(answer);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(answer, answerString, true);
        cy.wait(3000);

        // Get list of filtered answers rows and varify
        var answersData = getTableColumnData("Answer");
        cy.wrap(answersData).each((answer) => {
            expect(answerString.toLowerCase()).to.equal(answer);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(answer, invalidSearchInput, true);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });
});
