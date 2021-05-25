/// <reference types="cypress" />
import {
    login,
    clickByText,
    inputText,
    submitForm,
    exists,
    notExists,
} from "../../../../utils/utils";
import {
    controls,
    jobfunctions,
    button,
    minCharsMsg,
    max120CharsMsg,
    duplicateErrMsg,
    createNewButton,
} from "../../../types/constants";
import { Jobfunctions } from "../../../models/jobfunctions";
import { navMenu, navTab } from "../../../views/menu.view";
import { jobfunctionNameInput } from "../../../views/jobfunctions.view";
import * as commonView from "../../../../integration/views/commoncontrols.view";
import * as data from "../../../../utils/data_utils";

describe("Job Function Validations", () => {
    const jobfunction = new Jobfunctions(data.getJobTitle());

    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/job-function*").as("postJobfunctions");
    });

    it("Jobfunction field validations", function () {
        // Create new job function
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

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

    it("Jobfunction unique name constraint validation", function () {
        // Create new job function
        jobfunction.create();
        cy.wait("@postJobfunctions");
        exists(jobfunction.name);
        // Create job function with same name again
        clickByText(button, createNewButton);
        inputText(jobfunctionNameInput, jobfunction.name);
        submitForm();
        cy.get(commonView.duplicateNameWarning).should("contain.text", duplicateErrMsg);

        // Delete created jobfunction
        cy.get(commonView.closeButton).click();
        jobfunction.delete();
        notExists(jobfunction.name);
    });

    it("Jobfunction button validations", function () {
        // Navigate to jobfunction tab and click create new button
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
        clickByText(button, createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Cancel creating new job function
        cy.get(commonView.cancelButton).click();
        cy.wait(100);

        clickByText(button, createNewButton);

        // Close the "Create New" jobfunction form
        cy.get(commonView.closeButton).click();
        cy.wait(100);

        // Assert that jobfunction tab is opened
        cy.contains(button, createNewButton).should("exist");
    });

    it("jobfunction update", function () {
        // Edit job function and cancel
        jobfunction.create();
        jobfunction.edit(data.getJobTitle(), true);
        cy.wait(100);
        // Edit and Save
        jobfunction.edit(data.getJobTitle());
        cy.wait(100);
        jobfunction.delete();
    });
});
