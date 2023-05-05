/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
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
    deleteApplicationTableRows,
    selectUserPerspective,
    click,
    deleteAllTagsAndTagCategories,
} from "../../../../utils/utils";
import { navMenu } from "../../../views/menu.view";
import {
    reports,
    name,
    description,
    businessService,
    tag,
    button,
    clearAllFilters,
    category,
    question,
    answer,
    applicationInventory,
    migration,
} from "../../../types/constants";
import {
    adoptionCandidateDistributionTable,
    closeRowIdentifiedRisk,
} from "../../../views/reports.view";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import * as data from "../../../../utils/data_utils";
import { BusinessServices } from "../../../models/migration/controls/businessservices";
import {
    selectItemsPerPageAdoptionCandidate,
    selectItemsPerPageIdentifiedRisks,
    expandArticle,
} from "../../../models/migration/reports/reports";
import { Tag } from "../../../models/migration/controls/tags";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";

var applicationsList: Array<Assessment> = [];
var businessServiceList: Array<BusinessServices> = [];
var stakeholdersList: Array<Stakeholders> = [];
var tagList: Array<Tag> = [];
var invalidSearchInput = String(data.getRandomNumber());

describe(["@tier2"], "Reports filter validations", () => {
    before("Login and create test data", function () {
        // Perform login
        login();

        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(2);

        // Perform assessment of application
        applicationsList[0].perform_assessment("high", [stakeholdersList[0].name]);
        applicationsList[0].verifyStatus("assessment", "Completed");
        cy.wait(4000);
        // Perform application review
        applicationsList[0].perform_review("high");
        applicationsList[0].verifyStatus("review", "Completed");
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    after("Perform test data clean up", function () {
        selectUserPerspective(migration);
        clickByText(navMenu, applicationInventory);
        cy.wait(2000);

        // Delete the applications, stakeholders, business services and tag types
        deleteApplicationTableRows();
        deleteAllStakeholders();
    });

    it("Name field validations", function () {
        // Navigate to reports
        selectUserPerspective(migration);
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

        //close Row Details of Identified risks
        click(closeRowIdentifiedRisk);

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

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Application name field validations", function () {
        // Navigate to reports
        selectUserPerspective(migration);
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

        applySearchFilter(name, validSearchInput, true, 1);
        cy.wait(3000);

        // Get list of filtered applications rows and varify
        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(application).to.have.string(applicationsList[0].name);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(name, applicationsList[0].name, true);
        cy.wait(3000);

        // Get list of filtered applications rows and varify
        var applicationsData = getTableColumnData("Application(s)");
        cy.wrap(applicationsData).each((application) => {
            expect(application).to.have.string(applicationsList[0].name);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput, true, 1);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Category field validations", function () {
        // Navigate to reports
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Expand table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        // Get an category of assessment questions and apply it as search filter
        var categoryString = "Application details";
        var validSearchInput = categoryString.substring(0, 16);

        applySearchFilter(category, validSearchInput, true, 1);
        cy.wait(3000);

        // Get list of filtered category rows and varify
        var categoryData = getTableColumnData("Category");
        cy.wrap(categoryData).each((category) => {
            expect(categoryString.toLowerCase()).to.equal(category);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(category, categoryString, true, 1);
        cy.wait(3000);

        // Get list of filtered category rows and varify
        var categoryData = getTableColumnData("Category");
        cy.wrap(categoryData).each((category) => {
            expect(categoryString.toLowerCase()).to.equal(category);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(category, invalidSearchInput, true, 1);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Question field validations", function () {
        // Navigate to reports
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Expand table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        // Get a question from assessment question's list and apply it as search filter
        var questionString = "How is the application tested?";
        var validSearchInput = questionString.substring(0, 27);
        applySearchFilter(question, validSearchInput, true, 1);
        cy.wait(3000);

        // Get list of filtered questions rows and varify
        var questionsData = getTableColumnData("Question");
        cy.wrap(questionsData).each((question) => {
            expect(questionString.toLowerCase()).to.equal(question);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(question, questionString, true, 1);
        cy.wait(3000);

        // Get list of filtered questions rows and varify
        var questionsData = getTableColumnData("Question");
        cy.wrap(questionsData).each((question) => {
            expect(questionString.toLowerCase()).to.equal(question);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(question, invalidSearchInput, true, 1);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Identified risk - Answer field validations", function () {
        // Navigate to reports
        selectUserPerspective(migration);
        clickByText(navMenu, reports);
        cy.wait(2000);

        // Expand table Identified risks
        expandArticle("Identified risks");
        cy.wait(2000);

        selectItemsPerPageIdentifiedRisks(100);

        // select an answer input from existing answers and apply it as search filter
        var answerString = "Not tracked";
        var validSearchInput = answerString.substring(0, 7);
        applySearchFilter(answer, validSearchInput, true, 1);
        cy.wait(3000);

        // Get list of filtered answers rows and varify
        var answersData = getTableColumnData("Answer");
        cy.wrap(answersData).each((answer) => {
            expect(answerString.toLowerCase()).to.equal(answer);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        applySearchFilter(answer, answerString, true, 1);
        cy.wait(3000);

        // Get list of filtered answers rows and varify
        var answersData = getTableColumnData("Answer");
        cy.wrap(answersData).each((answer) => {
            expect(answerString.toLowerCase()).to.equal(answer);
        });

        // Clear all filters
        clickByText(button, clearAllFilters);

        // Enter a invalid substring and apply it as search filter
        applySearchFilter(answer, invalidSearchInput, true, 1);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });
});
