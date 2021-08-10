/// <reference types="cypress" />

import { login, clickByText, exists, applySearchFilter } from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, jobfunctions, button, name, clearAllFilters } from "../../../types/constants";

import { Jobfunctions } from "../../../models/jobfunctions";
import * as data from "../../../../utils/data_utils";

var jobfunctionsList: Array<Jobfunctions> = [];
var invalidSearchInput = String(data.getRandomNumber());

describe("Job function filter validations", function () {
    before("Login and Create Test Data", function () {
        login();

        // Create multiple job functions
        for (let i = 0; i < 2; i++) {
            // Create new job function
            const jobfunction = new Jobfunctions(data.getJobTitle());
            jobfunction.create();
            jobfunctionsList.push(jobfunction);
        }
    });

    after("Perform test data clean up", function () {
        // Delete the job functions
        jobfunctionsList.forEach(function (jobfunction) {
            jobfunction.delete();
        });
    });

    it("Name filter validations", function () {
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);

        // Enter an existing display name substring and assert
        var validSearchInput = jobfunctionsList[0].name.substring(0, 3);
        applySearchFilter(name, validSearchInput);
        exists(jobfunctionsList[0].name);
        clickByText(button, clearAllFilters);

        applySearchFilter(name, jobfunctionsList[1].name);
        exists(jobfunctionsList[1].name);
        clickByText(button, clearAllFilters);

        // Enter a non-existing display name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);

        // Assert that no search results are found
        cy.get("h2").contains("No results found");

        clickByText(button, clearAllFilters);
    });
});
