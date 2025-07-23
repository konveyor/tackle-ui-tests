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
    checkSuccessAlert,
    clickByText,
    closeRowDetails,
    createMultipleBusinessServices,
    createMultipleStakeholders,
    deleteByList,
    exists,
    existsWithinRow,
    expandRowDetails,
    getRandomApplicationData,
    inputText,
    login,
    selectFormItems,
} from "../../../../../utils/utils";
import {
    button,
    createNewButton,
    duplicateApplication,
    max120CharsMsg,
    max250CharsMsg,
    minCharsMsg,
    tdTag,
} from "../../../../types/constants";
import {
    applicationBusinessServiceSelect,
    applicationContributorsAction,
    applicationContributorsInput,
    applicationContributorsText,
    applicationDescriptionInput,
    applicationNameInput,
    applicationOwnerInput,
} from "../../../../views/applicationinventory.view";

import * as data from "../../../../../utils/data_utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Tag } from "../../../../models/migration/controls/tags";
import { MigrationWave } from "../../../../models/migration/migration-waves/migration-wave";
import * as commonView from "../../../../views/common.view";

let businessservicesList: Array<BusinessServices> = [];
let stakeHoldersList: Stakeholders[];

describe(["@tier2"], "Application validations", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        businessservicesList = createMultipleBusinessServices(1);
        stakeHoldersList = createMultipleStakeholders(2);
    });

    beforeEach("Interceptors", function () {
        cy.intercept("POST", "/hub/tag*").as("postTag");
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Application field validations", function () {
        Application.open();
        clickByText(button, createNewButton);
        selectFormItems(applicationBusinessServiceSelect, businessservicesList[0].name);

        // Name constraints
        inputText(applicationNameInput, data.getRandomWord(2));
        cy.get(commonView.helper).should("contain", minCharsMsg);
        inputText(applicationNameInput, data.getRandomWords(90));
        cy.get(commonView.helper).should("contain", max120CharsMsg);
        cy.get(applicationNameInput).clear();

        // Description constraint
        inputText(applicationDescriptionInput, data.getRandomWords(90));
        cy.get(commonView.helper).should("contain", max250CharsMsg);
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
            .closest("div")
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
            .closest("div")
            .should("contain", stakeHoldersList[0].name)
            .and("contain", stakeHoldersList[1].name);

        // Unassign contributor#1 and verify only contributor#2 is listed
        cy.get(applicationContributorsText)
            .contains(stakeHoldersList[0].name)
            .parent()
            .next(applicationContributorsAction)
            .click();
        cy.get(applicationContributorsInput)
            .closest("div")
            .should("contain", stakeHoldersList[1].name);

        // Close the form
        cy.get(commonView.closeButton).click();
        cy.wait(100);
    });

    it("Application button validations", function () {
        // Navigate to application inventory page and click create new button
        Application.open();
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new application
        cy.get(commonView.cancelButton).click();
        clickByText(button, createNewButton);

        // Close the "Create New" application inventory form
        cy.get(commonView.closeButton).click();

        // Assert that application inventory page is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Application success alert and unique constraint validation", function () {
        Application.open();
        const application = new Application(getRandomApplicationData());

        // Create a new application
        application.create();
        cy.wait("@getApplication");
        checkSuccessAlert(
            commonView.successAlertMessage,
            `Application ${application.name} was successfully created.`
        );
        cy.wait("@getApplication");
        exists(application.name);

        // Navigate to application inventory page and click create new button
        clickByText(button, createNewButton);

        // Check name duplication
        inputText(applicationNameInput, application.name);
        selectFormItems(applicationBusinessServiceSelect, businessservicesList[0].name);
        cy.get(commonView.helper).should("contain.text", duplicateApplication);
        cy.get(commonView.closeButton).click();
        application.delete();
    });

    it("Create tag from application side drawer", function () {
        // Automates Polarion MTA-321
        const application = new Application(getRandomApplicationData());
        const tag = new Tag(data.getRandomWord(8), data.getRandomDefaultTagCategory());

        application.create();
        cy.wait("@postApplication");
        exists(application.name);

        application.applicationDetailsTab("Tags");
        clickByText(button, "Create tag");

        tag.create();
        cy.wait("@postTag");

        // Assert that created tag exists
        expandRowDetails(tag.tagCategory);
        existsWithinRow(tag.tagCategory, tdTag, tag.name);
        closeRowDetails(tag.tagCategory);
        application.delete();
        tag.delete();
    });

    it("Update and validate application profile details", function () {
        let appdata = {
            name: data.getAppName(),
            description: data.getDescription(),
            sourceRepo: data.getRandomUrl(),
            group: data.getRandomUrl(),
            artifact: data.getRandomWord(8),
            version: data.getRandomWord(4),
        };
        let migrationWave: MigrationWave;
        const now = new Date();
        now.setDate(now.getDate() + 1);
        const end = new Date(now.getTime());
        end.setFullYear(end.getFullYear() + 1);

        const application = new Application(appdata);
        application.create();
        cy.wait("@getApplication");

        MigrationWave.open();

        // create new migration wave
        migrationWave = new MigrationWave(data.getRandomWord(8), now, end, null, null, [
            application,
        ]);
        migrationWave.create();

        application.validateAppInformationExist(appdata, migrationWave);
        application.closeApplicationDetails();

        // Update the application profile information
        let addComment = data.getDescription();
        let appdata1 = {
            name: appdata.name,
            owner: stakeHoldersList[0].name,
            comment: addComment,
            business: businessservicesList[0].name,
        };
        application.edit(appdata1, true);
        application.validateAppInformationExist(appdata1);
        application.closeApplicationDetails();
        migrationWave.delete();
        application.delete();
    });

    after("Perform test data clean up", function () {
        deleteByList(businessservicesList);
        deleteByList(stakeHoldersList);
    });
});
