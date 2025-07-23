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

import * as commonView from "../../../../../e2e/views/common.view";
import * as data from "../../../../../utils/data_utils";
import {
    checkSuccessAlert,
    clickByText,
    exists,
    inputText,
    notExists,
} from "../../../../../utils/utils";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import {
    button,
    createNewButton,
    duplicateStakeholderGroupName,
    max120CharsMsg,
    max250CharsMsg,
    minCharsMsg,
} from "../../../../types/constants";
import {
    stakeholdergroupDescriptionInput,
    stakeholdergroupNameInput,
} from "../../../../views/stakeholdergroups.view";

describe(["@tier2"], "Stakeholder groups validations", () => {
    const stakeholdergroup = new Stakeholdergroups(data.getCompanyName(), data.getDescription());

    it("Stakeholder group field validations", function () {
        Stakeholdergroups.openList();
        clickByText(button, createNewButton);

        // Name constraints
        inputText(stakeholdergroupNameInput, data.getRandomWord(2));
        cy.get(commonView.stakeHolderGroupHelper).should("contain", minCharsMsg);
        inputText(stakeholdergroupNameInput, data.getRandomWords(50));
        cy.get(commonView.stakeHolderGroupHelper).should("contain", max120CharsMsg);
        inputText(stakeholdergroupNameInput, data.getRandomWord(4));
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(stakeholdergroupDescriptionInput, data.getRandomWords(120));
        cy.get(commonView.stakeHolderGroupHelper).should("contain", max250CharsMsg);
        cy.get(commonView.cancelButton).trigger("click");
    });

    it("Stakholder group button validations", function () {
        Stakeholdergroups.openList();
        clickByText(button, createNewButton);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();

        clickByText(button, createNewButton);
        cy.get(commonView.closeButton).click();
        cy.contains(button, createNewButton).should("exist");
    });

    it("Stakeholder group success alert and unique constraint validation", function () {
        stakeholdergroup.create();
        checkSuccessAlert(
            commonView.successAlertMessage,
            "Success alert:Stakeholder group was successfully created."
        );

        exists(stakeholdergroup.name);
        clickByText(button, createNewButton);
        inputText(stakeholdergroupNameInput, stakeholdergroup.name);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.stakeHolderGroupHelper).should(
            "contain.text",
            duplicateStakeholderGroupName
        );
        cy.get(commonView.closeButton).click();
        stakeholdergroup.delete();
        notExists(stakeholdergroup.name);
    });
});
