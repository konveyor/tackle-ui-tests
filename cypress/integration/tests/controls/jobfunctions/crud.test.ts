/// <reference types="cypress" />

import { exists, hasToBeSkipped, login, notExists } from "../../../../utils/utils";
import { Jobfunctions } from "../../../models/jobfunctions";
import * as data from "../../../../utils/data_utils";

describe("Job Function CRUD operations", { tags: "@tier1" }, () => {
    const jobfunction = new Jobfunctions(data.getJobTitle());

    before("Login", () => {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

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
        exists(jobfunction.name);

        // Edit the current job function's name
        var updatedJobfuncName = data.getJobTitle();
        jobfunction.edit(updatedJobfuncName);
        cy.wait("@getJobfunctions");

        // Assert that jobfunction name got edited
        exists(updatedJobfuncName);

        // Delete job function
        jobfunction.delete();
        cy.wait("@getJobfunctions");

        // Assert that job function is deleted
        notExists(jobfunction.name);
    });
});
