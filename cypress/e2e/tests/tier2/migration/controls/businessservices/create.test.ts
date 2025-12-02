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
    clickJs,
    exists,
    inputText,
    notExists,
    selectUserPerspective,
} from "../../../../../utils/utils";
import {
    button,
    createNewButton,
    duplicateBusinessService,
    max120CharsMsg,
    max250CharsMsg,
    migration,
    minCharsMsg,
    SEC,
} from "../../../../types/constants";
import {
    businessServiceDescriptionInput,
    businessServiceNameInput,
} from "../../../../views/businessservices.view";
import * as commonView from "../../../../views/common.view";

import * as data from "../../../../../utils/data_utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { stakeHoldersTable } from "../../../../views/stakeholders.view";

describe(["@tier2"], "Business service validations", () => {
    it("Business service field validations", function () {
        BusinessServices.openList();
        clickByText(button, createNewButton);

        inputText(businessServiceNameInput, data.getRandomWord(2));
        cy.get(commonView.helperBusiness).should("contain", minCharsMsg);
        inputText(businessServiceNameInput, data.getRandomWords(45));
        cy.get(commonView.helperBusiness).should("contain", max120CharsMsg);
        inputText(businessServiceNameInput, data.getRandomWord(4));
        cy.get(commonView.submitButton).should("not.be.disabled");

        inputText(businessServiceDescriptionInput, data.getRandomWords(75));
        cy.get(commonView.helperBusiness).should("contain", max250CharsMsg);
        clickJs(commonView.cancelButton);
    });

    it("Business service button validations", function () {
        BusinessServices.openList();
        clickByText(button, createNewButton);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();
        clickByText(button, createNewButton);
        cy.get(commonView.closeButton).click();
        cy.contains(button, createNewButton).should("exist");
    });

    it("Bug MTA-3095: Business service success alert and unique constraint validation", function () {
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        const businessService = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );

        selectUserPerspective(migration);
        businessService.create();
        checkSuccessAlert(
            commonView.successAlertMessage,
            `Success alert:Business service ${businessService.name} was successfully created.`
        );
        exists(businessService.name);
        const businessService1 = new BusinessServices(data.getCompanyName(), data.getDescription());
        businessService1.create();
        checkSuccessAlert(
            commonView.successAlertMessage,
            `Success alert:Business service ${businessService1.name} was successfully created.`
        );

        clickByText(button, createNewButton);

        // Check name duplication
        inputText(businessServiceNameInput, businessService.name);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.helperBusiness).should("contain.text", duplicateBusinessService);

        // Delete created business service
        cy.get(commonView.closeButton).click();
        businessService.delete();
        checkSuccessAlert(commonView.successAlertMessage, `Success alert:Business service deleted`);
        // TODO: Remove workaround (cy.wait) once bug is fixed MTA-3095
        cy.wait(5 * SEC);
        businessService1.delete();
        checkSuccessAlert(commonView.successAlertMessage, `Success alert:Business service deleted`);
        stakeholder.delete();
        notExists(businessService.name);
    });

    it("Business service CRUD with owner", function () {
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        const businessService = new BusinessServices(
            data.getCompanyName(),
            data.getDescription(),
            stakeholder.name
        );
        businessService.create();
        exists(businessService.name);

        let updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        exists(updatedBusinessServiceName);

        businessService.delete();
        notExists(businessService.name);

        stakeholder.delete();
        notExists(stakeholder.email, stakeHoldersTable);
    });
});
