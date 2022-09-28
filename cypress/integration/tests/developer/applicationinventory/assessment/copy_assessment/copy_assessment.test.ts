/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    hasToBeSkipped,
    login,
    preservecookies,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    deleteAllStakeholders,
    deleteApplicationTableRows,
    deleteAllStakeholderGroups,
    createMultipleApplications,
    clickWithin,
} from "../../../../../../utils/utils";

import { Stakeholders } from "../../../../../models/developer/controls/stakeholders";
import { Stakeholdergroups } from "../../../../../models/developer/controls/stakeholdergroups";
import { trTag } from "../../../../../types/constants";
import { copy, selectBox } from "../../../../../views/applicationinventory.view";
import { Assessment } from "../../../../../models/developer/applicationinventory/assessment";
import { modal } from "../../../../../views/common.view";

var stakeholdersList: Array<Stakeholders> = [];
var stakeholdersList: Array<Stakeholders> = [];
var stakeholdergroupsList: Array<Stakeholdergroups> = [];
var applicationList: Array<Assessment> = [];

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

    it("Copy assessment to self", function () {
        // Copy assessment to self, checkbox should be disabled
        applicationList[0].openCopyAssessmentModel();
        cy.get(".pf-m-compact> tbody > tr > td")
            .contains(applicationList[0].name)
            .parent(trTag)
            .within(() => {
                cy.get(selectBox).should("be.disabled");
                cy.wait(2000);
            });
    });

    it("Copy button not enabled until one app is selected", function () {
        // Copy assessment to self, should be disabled
        applicationList[0].openCopyAssessmentModel();
        cy.wait(2000);
        cy.get(copy).should("be.disabled");
        applicationList[0].selectApps(applicationList);
        cy.get(copy).should("not.be.disabled");
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

    it("Copy assessment select options validations", function () {
        // Open copy assessment page
        applicationList[0].openCopyAssessmentModel();

        // select 10 items per page
        applicationList[0].selectItemsPerPage(10);
        cy.wait(1000);

        // Select all the applications on page
        clickWithin(modal, "button[aria-label='Select']");
        if (applicationList.length < 11) {
            cy.get("ul[role=menu] > li")
                .contains(`Select page (${applicationList.length} items)`)
                .click();
        } else {
            cy.get("ul[role=menu] > li").contains("Select page (10 items)").click();
        }
        cy.get("input[name='confirm']").check();
        cy.get(copy).should("be.visible").should("not.be.disabled");

        // Select all applications
        clickWithin(modal, "button[aria-label='Select']");
        cy.get("ul[role=menu] > li").contains(`Select all (${applicationList.length}`).click();
        cy.get("input[name='confirm']").check();
        cy.get(copy).should("be.visible").should("not.be.disabled");
        clickWithin(modal, "button[aria-label='Select']");

        // Deselect all applications
        clickWithin(modal, "button[aria-label='Select']");
        cy.get("ul[role=menu] > li").contains("Select none (0 items)").click();
        cy.get(copy).should("be.visible").should("be.disabled");
    });
});
