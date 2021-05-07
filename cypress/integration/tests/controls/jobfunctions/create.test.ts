/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag } from "../../../types/constants";

describe("Create New Job Function", () => {
    const jobfunctions = new Jobfunctions();

    before("Login", () => {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/job-function*").as("postJobfunction");
        cy.intercept("GET", "/api/controls/job-function*").as("getJobfunctions");
    });

    it("jobfunctions crud", function () {
        // Create new job function
        jobfunctions.create();
        cy.wait("@postJobfunction");

        // Edit job function name
        jobfunctions.edit();
        cy.wait("@getJobfunctions");

        // Delete job function
        jobfunctions.delete();
        cy.wait("@getJobfunctions");

        // Assert that job function is deleted
        cy.get(tdTag).should("not.contain", jobfunctions.jobfunctionName);
    });
});
