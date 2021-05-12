/// <reference types="cypress" />

import * as utils from "../../../../utils/utils";
import { Jobfunctions } from "../../../models/jobfunctions";
import { navMenu, navTab } from "../../../views/menu.view";
import  * as view from "../../../views/jobfunctions.view"
import * as constants from "../../../types/constants";
import * as commonView from "../../../../integration/views/commoncontrols.view";
import * as faker from "faker";

describe("Create New Job Function", () => {
    const jobfunctions = new Jobfunctions();

    beforeEach("Login", function () {
        // Perform login
        utils.login();
    });

    
    it("jobfunctions field validations", function () { 
        // Create new job function 
        utils.clickByText(navMenu, constants.controls);
        utils.clickByText(navTab, constants.jobfunctions);
        utils.clickByText(constants.button, constants.createNewButton);

        // Check "Create" and "Cancel" button status
        cy.get(commonView.submitButton).should("be.disabled");
        cy.get(commonView.cancelButton).should("not.be.disabled");

        // Name constraints
        utils.inputText(view.jobfunctionNameInput, " ");
        cy.get(view.jobfunctionsNameHelper).should("contain", "This field is required.");
        utils.inputText(view.jobfunctionNameInput, "ab");
        cy.wait(100)
        cy.get(view.jobfunctionsNameHelper).should("contain", "This field must contain at least 3 characters.");
        utils.inputText(view.jobfunctionNameInput, faker.random.words(50));
        cy.get(view.jobfunctionsNameHelper).should("contain", "This field must contain fewer than 120 characters.");
        utils.inputText(view.jobfunctionNameInput, "test");
        cy.get(commonView.submitButton).should("not.be.disabled");
        cy.get(commonView.cancelButton).click();
    });

    it("jobfunctions duplicate name", function () { 
        // Create new job function 
        jobfunctions.create(); 
        jobfunctions.create(jobfunctions.jobfunctionName); 
        cy.get(view.jobfunctionAlert).should("contain.text", "ERROR: duplicate key value violates unique constraint"); 
        cy.wait(100); 
        cy.get(commonView.closeButton).click(); 
        jobfunctions.delete() 
    });

    it("jobfunctions update", function () { 
        // Edit job function and cancel
        jobfunctions.create(); 
        jobfunctions.edit(faker.name.jobType(), true); 
        cy.wait(100); 
        // Edit and Save
        jobfunctions.edit(faker.name.jobType()); 
        cy.wait(100); 
        jobfunctions.delete() 
    });

});
