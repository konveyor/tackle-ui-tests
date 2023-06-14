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
    preservecookies,
    createMultipleBusinessServices,
    selectFormItems,
    deleteApplicationTableRows,
    deleteAllBusinessServices,
    getRandomApplicationData,
    createMultipleApplications,
    application_inventory_kebab_menu,
    navigate_to_application_inventory,
    createMultipleStakeholders,
    deleteAllStakeholders,
} from "../../../../../utils/utils";
import {
    button,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    duplicateApplication,
    createNewButton,
} from "../../../../types/constants";
import {
    applicationDescriptionInput,
    applicationNameInput,
    applicationBusinessServiceSelect,
    applicationContributorsInput,
    applicationOwnerInput,
} from "../../../../views/applicationinventory.view";

import * as commonView from "../../../../views/common.view";
import * as data from "../../../../../utils/data_utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";

let businessservicesList: Array<BusinessServices> = [];
let applicationList: Array<Assessment> = [];
let stakeHoldersList: Stakeholders[];

describe(["@tier2"], "Application validations", () => {
    before("Login", function () {
        // Perform login
        login();
        deleteApplicationTableRows();
        businessservicesList = createMultipleBusinessServices(1);
        stakeHoldersList = createMultipleStakeholders(2);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        deleteAllStakeholders();
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

        // Owner validation, Polarion TC 330
        inputText(applicationOwnerInput, stakeHoldersList[0].name);
        cy.get("button").contains(stakeHoldersList[0].name).click();

        cy.get(applicationOwnerInput)
            .invoke("val")
            .then((value) => {
                expect(value).to.contain(stakeHoldersList[0].name);
            });

        cy.get(applicationOwnerInput)
            .parent()
            .next("button")
            .click()
            .then(() => {
                cy.get(applicationOwnerInput)
                    .invoke("val")
                    .then((newValue) => {
                        expect(newValue).to.not.contain(stakeHoldersList[0].name);
                    });
            });

        // Contributors Validation, Polarion TC 331
        inputText(applicationContributorsInput, stakeHoldersList[0].name);
        cy.get("button").contains(stakeHoldersList[0].name).click();

        inputText(applicationContributorsInput, stakeHoldersList[1].name);
        cy.get("button").contains(stakeHoldersList[1].name).click();

        cy.get(applicationContributorsInput)
            .parent()
            .should("contain", stakeHoldersList[0].name)
            .and("contain", stakeHoldersList[1].name);

        cy.get(applicationContributorsInput)
            .parent()
            .contains("span", stakeHoldersList[0].name)
            .next("button")
            .click();

        cy.get(applicationContributorsInput).parent().and("contain", stakeHoldersList[1].name);

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
        cy.get(commonView.nameHelper).should("contain.text", duplicateApplication);
        cy.get(commonView.closeButton).click();
    });

    it("Bulk deletion of applications - Select page ", function () {
        applicationList = createMultipleApplications(11);
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

    it("Bulk deletion of applications - Delete all apps by selecting checkbox ", function () {
        applicationList = createMultipleApplications(11);
        navigate_to_application_inventory();
        // Click 'bulk-selected-apps-checkbox'.
        cy.get("input#bulk-selected-apps-checkbox").check({ force: true });

        application_inventory_kebab_menu("Delete");
        clickByText(button, "Delete");
        for (let i = 0; i < applicationList.length; i++) {
            notExists(applicationList[i].name);
        }
    });
});
