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
    submitForm,
    exists,
    notExists,
    hasToBeSkipped,
    preservecookies,
    createMultipleBusinessServices,
    selectFormItems,
    deleteApplicationTableRows,
    deleteAllBusinessServices,
} from "../../../../../../utils/utils";
import {
    button,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    duplicateName,
    createNewButton,
} from "../../../../../types/constants";
import {
    applicationDescriptionInput,
    applicationNameInput,
    applicationBusinessServiceSelect,
} from "../../../../../views/applicationinventory.view";
import { ApplicationInventory } from "../../../../../models/developer/applicationinventory/applicationinventory";

import * as commonView from "../../../../../views/common.view";
import * as data from "../../../../../../utils/data_utils";
import { BusinessServices } from "../../../../../models/developer/controls/businessservices";

var businessservicesList: Array<BusinessServices> = [];

describe("Source Analysis", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
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
        deleteAllBusinessServices();
        deleteApplicationTableRows();
    });

    it("Application field validations", function () {
        // Navigate to application inventory page and click "Create New" button
        ApplicationInventory.clickApplicationInventory();
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

   
});
