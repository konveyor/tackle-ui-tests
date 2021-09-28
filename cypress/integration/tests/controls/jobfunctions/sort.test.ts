/// <reference types="cypress" />

import {
    login,
    clickByText,
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    preservecookies,
    hasToBeSkipped,
} from "../../../../utils/utils";
const { _ } = Cypress;
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, name, jobfunctions } from "../../../types/constants";

import { Jobfunctions } from "../../../models/jobfunctions";
import * as data from "../../../../utils/data_utils";

var jobfunctionsList: Array<Jobfunctions> = [];

describe("Job function sorting", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Create multiple job functions
        for (let i = 0; i < 2; i++) {
            // Create new job function
            const jobfunction = new Jobfunctions(data.getJobTitle());
            jobfunction.create();
            jobfunctionsList.push(jobfunction);
        }
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/controls/job-function*").as("getJobfunctions");
    });

    after("Perform test data clean up", function () {
        // Delete the job functions after before the tests
        jobfunctionsList.forEach(function (jobfunction) {
            jobfunction.delete();
        });
    });

    it("Name sort validations", function () {
        // Navigate to job functions tab
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
        cy.wait("@getJobfunctions");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the Job functions by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the job function rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the job function by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the job function rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
