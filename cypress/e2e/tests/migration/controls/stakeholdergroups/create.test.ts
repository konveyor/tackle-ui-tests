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
    selectUserPerspective,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import {
    controls,
    stakeholderGroups,
    button,
    minCharsMsg,
    max120CharsMsg,
    max250CharsMsg,
    createNewButton,
    duplicateStakeholderGroupName,
    migration,
} from "../../../../types/constants";
import {
    stakeholdergroupNameInput,
    stakeholdergroupDescriptionInput,
} from "../../../../views/stakeholdergroups.view";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import * as data from "../../../../../utils/data_utils";
import * as commonView from "../../../../../e2e/views/common.view";

describe(["@tier2"], "Stakeholder groups validations", () => {
    const stakeholdergroup = new Stakeholdergroups(data.getCompanyName(), data.getDescription());

    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        login();
    });

    it("Stakeholder group field validations", function () {
        // Navigate to stakeholder group tab and click "Create New" button
        Stakeholdergroups.openList();
        clickByText(button, createNewButton);

        // Name constraints
        inputText(stakeholdergroupNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelper).should("contain", minCharsMsg);
        inputText(stakeholdergroupNameInput, data.getRandomWords(50));
        cy.get(commonView.nameHelper).should("contain", max120CharsMsg);
        inputText(stakeholdergroupNameInput, data.getRandomWord(4));
        cy.get(commonView.submitButton).should("not.be.disabled");

        // Description constraints
        inputText(stakeholdergroupDescriptionInput, data.getRandomWords(120));
        cy.get(commonView.descriptionHelper).should("contain", max250CharsMsg);

        // Close the form
        cy.get(commonView.cancelButton).trigger("click");
    });

    it("Stakholder group button validations", function () {
        // Navigate to stakeholder group tab and click "Create New" button
        Stakeholdergroups.openList();
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating stakeholder group
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" stakeholder group form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that stakholder group tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Stakeholder group unique constraint validation", function () {
        selectUserPerspective(migration);

        // Create new stakeholder group
        stakeholdergroup.create();
        exists(stakeholdergroup.name);

        // Navigate to stakeholder group tab and click "Create New" button
        clickByText(button, createNewButton);

        // Check name duplication
        inputText(stakeholdergroupNameInput, stakeholdergroup.name);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.nameHelper).should("contain.text", duplicateStakeholderGroupName);

        // Delete created stakeholder group
        cy.get(commonView.closeButton).click();
        stakeholdergroup.delete();
        notExists(stakeholdergroup.name);
    });
});
