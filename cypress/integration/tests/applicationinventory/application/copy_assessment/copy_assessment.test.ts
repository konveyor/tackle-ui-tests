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
    deleteAllStakeholderGroups,
} from "../../../../../utils/utils";
import { ApplicationInventory } from "../../../../models/applicationinventory/applicationinventory";

import { Stakeholders } from "../../../../models/stakeholders";
import { Stakeholdergroups } from "../../../../models/stakeholdergroups";
import { trTag } from "../../../../types/constants";
import { selectBox } from "../../../../views/applicationinventory.view";

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

        // Verify copy assessment is not enabled untill assessment is done
        applicationList[0].verifyCopyAssessmentDisabled();

        // Perform assessment of application
        applicationList[0].perform_assessment("low", [stakeholdersList[0].name]);
        cy.wait(2000);
        applicationList[0].is_assessed();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("GET", "/api/application-inventory/application*").as("getApplication");
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

    it("Copy assessment to self", function () {
        // Copy assessment to self, should be disabled
        applicationList[0].openCopyAssessmentModel();
        cy.get(".pf-m-compact> tbody > tr > td")
            .contains(applicationList[0].name)
            .parent(trTag)
            .within(() => {
                cy.get(selectBox).should("be.disabled");
                cy.wait(2000);
            });
    });

    it("Copy assessment to more than one application", function () {
        // Verify copy assessment is not enabled untill assessment is done
        applicationList[1].verifyCopyAssessmentDisabled();

        // Perform copy assessment of all the applications
        applicationList[0].copy_assessment(applicationList);
        cy.wait(4000);

        // Verify that all the applications were assessed
        for (let i = 1; i < applicationList.length; i++) {
            applicationList[i].is_assessed();
        }
    });
});
