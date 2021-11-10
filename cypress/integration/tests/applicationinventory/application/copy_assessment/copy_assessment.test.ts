/// <reference types="cypress" />

import {
    hasToBeSkipped,
    login,
    preservecookies,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    createMultipleApplications,
    deleteAllStakeholders,
    deleteApplicationTableRows,
} from "../../../../../utils/utils";
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
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        deleteApplicationTableRows();

        // Create data
        stakeholdersList = createMultipleStakeholders(1);
        stakeholdergroupsList = createMultipleStakeholderGroups(1, stakeholdersList);
        applicationList = createMultipleApplications(2);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier1")) return;

        // Delete the stakeholders created before the tests
        deleteAllStakeholders();
    });

    it("Copy assessment to itself", function () {
        // Perform assessment of application

        applicationList[0].perform_assessment("low", [stakeholdersList[0].name]);
        cy.wait(2000);
        applicationList[0].is_assessed();
        //TO -do check if button is disabled if not assessed

        // copy assessment
        applicationList[0].copy_assessment(applicationList);
        cy.wait(2000);
    });
});
