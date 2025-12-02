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
import * as data from "../../../../../utils/data_utils";
import { clickByText, clickJs, exists, inputText, notExists } from "../../../../../utils/utils";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import {
    button,
    createNewButton,
    duplicateJobFunctionName,
    max120CharsMsg,
    minCharsMsg,
} from "../../../../types/constants";
import * as commonView from "../../../../views/common.view";
import { jobfunctionNameInput } from "../../../../views/jobfunctions.view";

describe(["@tier2"], "Job Function Validations", () => {
    const jobfunction = new Jobfunctions(data.getJobTitle());

    beforeEach("Interceptors", function () {
        cy.intercept("POST", "/hub/jobfunctions*").as("postJobfunctions");
    });

    it("Job function Name field validations", function () {
        Jobfunctions.openList();
        clickByText(button, createNewButton);
        inputText(jobfunctionNameInput, " ");
        cy.get(commonView.helper).should("contain", "This field is required.");
        inputText(jobfunctionNameInput, data.getRandomWord(2));
        cy.get(commonView.helper).should("contain", minCharsMsg);
        inputText(jobfunctionNameInput, data.getRandomWords(90));
        cy.get(commonView.helper).should("contain", max120CharsMsg);
        inputText(jobfunctionNameInput, data.getRandomWord(10));
        cy.get(commonView.submitButton).should("not.be.disabled");
        clickJs(commonView.cancelButton);
    });

    it("Job function success alert and unique name constraint validation", function () {
        jobfunction.create();
        cy.get(commonView.successAlertMessage).then(($div) => {
            assert($div.text().toString(), "Success alert:Job function was successfully created.");
        });
        cy.wait("@postJobfunctions");
        exists(jobfunction.name);
        clickByText(button, createNewButton);
        inputText(jobfunctionNameInput, jobfunction.name);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.helper).should("contain.text", duplicateJobFunctionName);
        cy.get(commonView.closeButton).click();
        jobfunction.delete();
        notExists(jobfunction.name);
    });

    it("Job function button validations", function () {
        Jobfunctions.openList();
        clickByText(button, createNewButton);
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();
        clickByText(button, createNewButton);
        cy.get(commonView.closeButton).click();
        cy.contains(button, createNewButton).should("exist");
    });

    it("Job function update and cancel validation", function () {
        jobfunction.create();
        jobfunction.edit(data.getJobTitle(), true);
        jobfunction.delete();
    });
});
