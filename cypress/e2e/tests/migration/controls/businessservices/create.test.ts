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
    selectUserPerspective,
    checkSuccessAlert,
} from "../../../../../utils/utils";
import {
    button,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    createNewButton,
    duplicateBusinessService,
    migration,
} from "../../../../types/constants";
import {
    businessServiceNameInput,
    businessServiceDescriptionInput,
} from "../../../../views/businessservices.view";
import * as commonView from "../../../../views/common.view";

import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import * as data from "../../../../../utils/data_utils";

describe(["@tier2"], "Business service validations", () => {
    before("Login", function () {
        login();
    });

    it("Business service field validations", function () {
        BusinessServices.openList();
        clickByText(button, createNewButton);

        // Name constraints
        inputText(businessServiceNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelperBusiness).should("contain", minCharsMsg);
        inputText(businessServiceNameInput, data.getRandomWords(45));
        cy.get(commonView.nameHelperBusiness).should("contain", max120CharsMsg);
        inputText(businessServiceNameInput, data.getRandomWord(4));
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(businessServiceDescriptionInput, data.getRandomWords(75));
        cy.get(commonView.descriptionHelper).should("contain", max250CharsMsg);

        // Close the form
        cy.get(commonView.cancelButton).click();
    });

    it("Business service button validations", function () {
        BusinessServices.openList();
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating business service
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" business service form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that business service tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Business service success alert and unique constraint validation", function () {
        const businessService = new BusinessServices(data.getCompanyName());

        selectUserPerspective(migration);

        // Create new business service
        businessService.create();
        checkSuccessAlert(
            commonView.successAlertMessage,
            `Success alert:business service ${businessService.name} was successfully saved.`
        );
        exists(businessService.name);

        // Navigate to business service tab and click "Create New" button
        clickByText(button, createNewButton);

        // Check name duplication
        inputText(businessServiceNameInput, businessService.name);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.nameHelperBusiness).should("contain.text", duplicateBusinessService);

        // Delete created business service
        cy.get(commonView.closeButton).click();
        businessService.delete();
        notExists(businessService.name);
    });
});
