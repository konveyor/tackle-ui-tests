/// <reference types="cypress" />

import {
    hasToBeSkipped,
    login,
    preservecookies,
    sortAscCopyAssessmentTable,
    sortDescCopyAssessmentTable,
    verifySortAsc,
    verifySortDesc,
    getColumnDataforCopyAssessmentTable,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    createMultipleApplications,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    deleteAllStakeholderGroups,
} from "../../../../../utils/utils";
import { name } from "../../../../types/constants";
import { ApplicationInventory } from "../../../../models/applicationinventory/applicationinventory";

import { Stakeholders } from "../../../../models/stakeholders";
import { Stakeholdergroups } from "../../../../models/stakeholdergroups";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersList: Array<Stakeholders> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var applicationList: Array<ApplicationInventory> = [];

describe("Copy assessment and review tests", { tags: "@newtest" }, () => {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@newtest")) return;

        // Perform login
        login();

        deleteApplicationTableRows();

        // Create data
        stakeholdersList = createMultipleStakeholders(1);
        stakeholdergroupsList = createMultipleStakeholderGroups(1, stakeholdersList);
        applicationList = createMultipleApplications(4);

        // Perform assessment of application
        applicationList[0].perform_assessment("low", [stakeholdersList[0].name]);
        cy.wait(2000);
        applicationList[0].is_assessed();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@newtest")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();

        // Delete the stakeholder groups created before the tests
        deleteAllStakeholderGroups();

        // Delete the applications created at the start of test
        deleteApplicationTableRows();
    });

    it("Application name sort validations", function () {
        // Navigate to application inventory page and open copy assessment page
        applicationList[0].openCopyAssessmentModel();
        cy.wait(2000);

        // get unsorted list when page loads
        const unsortedList = getColumnDataforCopyAssessmentTable(name);

        // Sort the applications groups by name in ascending order
        sortAscCopyAssessmentTable(name);
        cy.wait(2000);

        // Verify that the applications rows are displayed in ascending order
        const afterAscSortList = getColumnDataforCopyAssessmentTable(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the applications by name in descending order
        sortDescCopyAssessmentTable(name);
        cy.wait(2000);

        // Verify that the applications are displayed in descending order
        const afterDescSortList = getColumnDataforCopyAssessmentTable(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
