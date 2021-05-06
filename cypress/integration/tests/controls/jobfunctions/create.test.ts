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
        cy.intercept("POST", "/api/controls/job-function*").as("postJobFunction");
        cy.intercept("GET", "/api/controls/job-function*").as("getJobFunctions");
    });

    it("jobfunctions crud", function () {

        // Create new job function
        jobfunctions.create();
        cy.wait("@postJobFunction");

        // Edit job function name
        jobfunctions.edit();
        cy.wait("@getJobFunctions");

        // Delete job function
        jobfunctions.delete();
        cy.wait("@getJobFunctions");

        // Assert that job function is deleted
        cy.get(tdTag).should("not.contain", jobfunctions.jobFunctionName);
    });
});
