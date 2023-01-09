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
    inputText,
    exists,
    notExists,
    hasToBeSkipped,
    preservecookies,
    createMultipleBusinessServices,
    selectFormItems,
    deleteApplicationTableRows,
    deleteAllBusinessServices,
    getRandomApplicationData,
    click,
    createMultipleApplications,
    application_inventory_kebab_menu,
    navigate_to_application_inventory,
} from "../../../../../utils/utils";
import {
    button,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    duplicateName,
    createNewButton,
} from "../../../../types/constants";
import {
    applicationDescriptionInput,
    applicationNameInput,
    applicationBusinessServiceSelect,
    actionButton,
} from "../../../../views/applicationinventory.view";

import * as commonView from "../../../../views/common.view";
import * as data from "../../../../../utils/data_utils";
import { BusinessServices } from "../../../../models/developer/controls/businessservices";
import { Assessment } from "../../../../models/developer/applicationinventory/assessment";

var businessservicesList: Array<BusinessServices> = [];
var applicationList: Array<Assessment> = [];

describe("Application validations", { tags: "@tier2" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        deleteApplicationTableRows();
        applicationList = createMultipleApplications(11);
        businessservicesList = createMultipleBusinessServices(1);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;
        deleteApplicationTableRows();
        deleteAllBusinessServices();
    });

    it("Application field validations", function () {
        // Navigate to application inventory page and click "Create New" button
        Assessment.open();
        clickByText(button, createNewButton);

        selectFormItems(applicationBusinessServiceSelect, businessservicesList[0].name);

        // Name constraints
        inputText(applicationNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelper).should("contain", minCharsMsg);
        inputText(applicationNameInput, data.getRandomWords(90));
        cy.get(commonView.nameHelper).should("contain", max120CharsMsg);

        // Description constraint
        inputText(applicationDescriptionInput, data.getRandomWords(90));
        cy.get(commonView.descriptionHelper).should("contain", max250CharsMsg);
        // Clear description field to make it valid input
        cy.get(applicationDescriptionInput).clear();

        // Validate the create button is enabled with valid inputs
        inputText(applicationNameInput, data.getFullName());
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Close the form
        cy.get(commonView.closeButton).click();
        cy.wait(100);
    });

    it("Application button validations", function () {
        // Navigate to application inventory page and click create new button
        Assessment.open();
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new application
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" application inventory form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that application inventory page is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Application unique constraint validation", function () {
        Assessment.open();
        const application = new Assessment(getRandomApplicationData());

        // Create a new application
        application.create();
        cy.wait("@postApplication");
        exists(application.name);

        // Navigate to application inventory page and click create new button
        clickByText(button, createNewButton);

        // Check name duplication
        inputText(applicationNameInput, application.name);
        selectFormItems(applicationBusinessServiceSelect, businessservicesList[0].name);
        cy.get(commonView.nameHelper).should("contain.text", duplicateName);

        // Delete created application
        cy.get(commonView.closeButton).click();
        application.delete();
        cy.wait("@getApplication");
        notExists(application.name);
    });

    it("Bulk deletion of applications - Select page ", function () {
        navigate_to_application_inventory();
        // Click dropdown toggle button to make 'Select page' selection.
        cy.get("button[aria-label='Select']").click();
        cy.get("ul[role=menu] > li").contains("Select page").click();

        application_inventory_kebab_menu("Delete");
        clickByText(button, "Delete");

        // Assert that all applications except the one(s) on the next page have been deleted.
        for (let i = 0; i < applicationList.length - 1; i++) {
            notExists(applicationList[i].name);
        }
        exists(applicationList[applicationList.length - 1].name);
    });

    it("Bulk deletion of applications - Select all ", function () {
        applicationList = createMultipleApplications(11);
        navigate_to_application_inventory();
        // Click dropdown toggle button to make 'Select all' selection.
        cy.get("button[aria-label='Select']").click();
        cy.get("ul[role=menu] > li").contains("Select all").click();

        application_inventory_kebab_menu("Delete");
        clickByText(button, "Delete");
        for (let i = 0; i < applicationList.length; i++) {
            notExists(applicationList[i].name);
        }
    });
});
