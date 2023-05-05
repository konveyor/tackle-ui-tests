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
    selectUserPerspective,
} from "../../../../../utils/utils";
import {
    controls,
    jobFunctions,
    button,
    minCharsMsg,
    max120CharsMsg,
    createNewButton,
    duplicateJobFunctionName,
    migration,
} from "../../../../types/constants";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import { navMenu, navTab } from "../../../../views/menu.view";
import { jobfunctionNameInput } from "../../../../views/jobfunctions.view";
import * as commonView from "../../../../views/common.view";
import * as data from "../../../../../utils/data_utils";

describe(["@tier2"], "Job Function Validations", () => {
    const jobfunction = new Jobfunctions(data.getJobTitle());

    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/jobfunctions*").as("postJobfunctions");
    });

    it("Job function field validations", function () {
        // Create new job function
        Jobfunctions.openList();
        clickByText(button, createNewButton);

        // Name constraints
        inputText(jobfunctionNameInput, " ");
        cy.get(commonView.nameHelper).should("contain", "This field is required.");
        inputText(jobfunctionNameInput, data.getRandomWord(2));
        cy.get(commonView.nameHelper).should("contain", minCharsMsg);
        inputText(jobfunctionNameInput, data.getRandomWords(90));
        cy.get(commonView.nameHelper).should("contain", max120CharsMsg);
        inputText(jobfunctionNameInput, data.getRandomWord(10));
        cy.get(commonView.submitButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();
    });

    it("Job function unique name constraint validation", function () {
        selectUserPerspective(migration);

        // Create new job function
        jobfunction.create();
        cy.wait("@postJobfunctions");
        exists(jobfunction.name);
        // Create job function with same name again
        clickByText(button, createNewButton);
        inputText(jobfunctionNameInput, jobfunction.name);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.nameHelper).should("contain.text", duplicateJobFunctionName);

        // Delete created jobfunction
        cy.get(commonView.closeButton).click();
        jobfunction.delete();
        notExists(jobfunction.name);
    });

    it("Job function button validations", function () {
        // Navigate to job function tab and click create new button
        Jobfunctions.openList();
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new job function
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" job function form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that job function tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("Job function update and cancel validation", function () {
        // Edit job function and cancel
        jobfunction.create();
        jobfunction.edit(data.getJobTitle(), true);
        cy.wait(100);
        jobfunction.delete();
    });
});
