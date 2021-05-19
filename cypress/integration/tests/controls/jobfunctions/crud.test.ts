/// <reference types="cypress" />

import { login } from "../../../../utils/utils";
import { Jobfunctions } from "../../../models/jobfunctions";
import { tdTag } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";

describe("Job Function CRUD operations", () => {
    const jobfunction = new Jobfunctions(data.getJobFuncName());

    before("Login", () => {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/job-function*").as("postJobfunction");
        cy.intercept("GET", "/api/controls/job-function*").as("getJobfunctions");
    });

    it("Jobfunction CRUD", function () {
        // Create new job function
        jobfunction.create();
        cy.wait("@postJobfunction");

        // Edit job function name
        var updatedJobfuncName = data.getJobFuncName();
        jobfunction.edit(updatedJobfuncName);
        cy.wait("@getJobfunctions");

        // Assert that jobfunction name got edited
        cy.get(tdTag).should("contain", updatedJobfuncName);

        // Delete job function
        jobfunction.delete();
        cy.wait("@getJobfunctions");

        // Assert that job function is deleted
        cy.get(tdTag).should("not.contain", jobfunction.name);
    });
});
