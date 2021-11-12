/// <reference types="cypress" />

import {
    hasToBeSkipped,
    login,
    preservecookies,
    createMultipleStakeholders,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    createMultipleBusinessServices,
    createMultipleTags,
    createApplicationObjects,
    applySearchFilter,
    clickByText,
    deleteAllBusinessServices,
    deleteAllTagTypes,
} from "../../../../../utils/utils";
import { ApplicationInventory } from "../../../../models/applicationinventory/applicationinventory";

import { Stakeholders } from "../../../../models/stakeholders";
import {
    businessservice,
    button,
    clearAllFilters,
    description,
    name,
    tag,
} from "../../../../types/constants";
import { BusinessServices } from "../../../../models/businessservices";
import { Tag } from "../../../../models/tags";
import { closeButton } from "../../../../views/common.view";
import { copyAssessmentTableTd } from "../../../../views/applicationinventory.view";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersList: Array<Stakeholders> = [];
var businessservicesList: Array<BusinessServices> = [];
var applicationList: Array<ApplicationInventory> = [];
var tagList: Array<Tag> = [];
var invalidSearchInput = "11111";

describe("Copy assessment filter tests", { tags: "@newtest" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Create data
        stakeholdersList = createMultipleStakeholders(1);
        businessservicesList = createMultipleBusinessServices(2);
        tagList = createMultipleTags(2);
        applicationList = createApplicationObjects(4);

        // Assign same business service to application number 2 and 3
        applicationList[1].business = businessservicesList[0].name;
        applicationList[2].business = businessservicesList[0].name;

        // Assign unique description to application number 3
        applicationList[2].description = "Description for test application";

        // Assign tag to application number 4
        applicationList[3].tags = [tagList[0].name];

        for (let i = 0; i < applicationList.length; i++) {
            applicationList[i].create();
        }

        // Perform assessment of application 1
        applicationList[0].perform_assessment("low", [stakeholdersList[0].name]);
        cy.wait(2000);
        applicationList[0].is_assessed();
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@newtest")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();

        // Delete the business services created before the test
        deleteAllBusinessServices();

        // Delete the tags created before the tests
        deleteAllTagTypes();

        // Delete the applications created at the start of test
        deleteApplicationTableRows();
    });

    it("Name filter validations", function () {
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter an existing application name and assert
        var validSearchInput = applicationList[1].name;
        applySearchFilter(name, validSearchInput, true);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd).should("contain", applicationList[1].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing application name and apply it as search filter
        applySearchFilter(name, invalidSearchInput, true);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });

    it("Description filter validations", function () {
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter an existing application description and assert
        var validSearchInput = applicationList[2].description;
        applySearchFilter(description, validSearchInput, true);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd).should("contain", applicationList[2].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing description and apply it as search filter
        applySearchFilter(description, invalidSearchInput, true);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });

    it("Bussiness service filter validations", function () {
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter an existing business seervice linked to application and assert
        var validSearchInput = applicationList[1].business;
        applySearchFilter(businessservice, validSearchInput, true);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd)
            .should("contain", applicationList[1].name)
            .and("contain", applicationList[2].name);
        clickByText(button, clearAllFilters);

        // Enter a business service not linked to any application and apply it as search filter
        applySearchFilter(businessservice, businessservicesList[1].name, true);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });

    it("Tag filter validations", function () {
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter a tag linked to application and assert
        var validSearchInput = applicationList[3].tags[0];
        applySearchFilter(tag, validSearchInput, true);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd).should("contain", applicationList[3].name);
        clickByText(button, clearAllFilters);

        // Enter a tag name not linked to any application and apply it as search filter
        applySearchFilter(tag, tagList[1].name, true);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });
});
