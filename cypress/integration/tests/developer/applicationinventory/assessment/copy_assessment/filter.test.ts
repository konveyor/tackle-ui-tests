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
    deleteAllTagsAndTagTypes,
} from "../../../../../../utils/utils";

import { Stakeholders } from "../../../../../models/developer/controls/stakeholders";
import {
    businessService,
    button,
    clearAllFilters,
    description,
    name,
    tag,
} from "../../../../../types/constants";
import { BusinessServices } from "../../../../../models/developer/controls/businessservices";
import { Tag } from "../../../../../models/developer/controls/tags";
import { closeButton } from "../../../../../views/common.view";
import { copyAssessmentTableTd } from "../../../../../views/applicationinventory.view";
import { Assessment } from "../../../../../models/developer/applicationinventory/assessment";

var stakeholdersList: Array<Stakeholders> = [];
var businessservicesList: Array<BusinessServices> = [];
var applicationList: Array<Assessment> = [];
var tagList: Array<Tag> = [];
var invalidSearchInput = "11111";

describe("Copy assessment filter tests", { tags: "@newtest" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

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

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@newtest")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();

        // Delete the applications created at the start of test
        deleteApplicationTableRows();

        // Delete the business services created before the test
        deleteAllBusinessServices();

        // Delete the tags created before the tests
        deleteAllTagsAndTagTypes();
    });

    it("Name filter validations", function () {
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter an existing application name and assert
        var validSearchInput = applicationList[1].name;
        applySearchFilter(name, validSearchInput, true, 1);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd).should("contain", applicationList[1].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing application name and apply it as search filter
        applySearchFilter(name, invalidSearchInput, true, 1);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });

    it("Description filter validations", function () {
        // This test fails because of this Tackle 2.x issue - https://issues.redhat.com/browse/TACKLE-822
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter an existing application description and assert
        var validSearchInput = applicationList[2].description;
        applySearchFilter(description, validSearchInput, true, 1);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd).should("contain", applicationList[2].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing description and apply it as search filter
        applySearchFilter(description, invalidSearchInput, true, 1);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });

    it("Bussiness service filter validations", function () {
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter an existing business seervice linked to application and assert
        var validSearchInput = applicationList[1].business;
        applySearchFilter(businessService, validSearchInput, true, 1);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd)
            .should("contain", applicationList[1].name)
            .and("contain", applicationList[2].name);

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });

    it("Tag filter validations", function () {
        // This test fails because of this Tackle 2.x issue - https://issues.redhat.com/browse/TACKLE-822
        // Open the copy assessment model for application 1
        applicationList[0].openCopyAssessmentModel();

        // Enter a tag linked to application and assert
        var validSearchInput = applicationList[3].tags[0];
        applySearchFilter(tag, validSearchInput, true, 1);
        cy.wait(2000);
        cy.get(copyAssessmentTableTd).should("contain", applicationList[3].name);
        clickByText(button, clearAllFilters);

        // Enter a tag name not linked to any application and apply it as search filter
        applySearchFilter(tag, tagList[1].name, true, 1);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No data available");

        // Clear all filters and close model
        clickByText(button, clearAllFilters);
        cy.get(closeButton).click();
    });
});
