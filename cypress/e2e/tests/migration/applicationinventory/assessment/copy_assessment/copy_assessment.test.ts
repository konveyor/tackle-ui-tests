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
    login,
    createMultipleStakeholders,
    createMultipleApplications,
    clickWithin,
    deleteByList,
    click,
    selectCheckBox,
    clickByText,
} from "../../../../../../utils/utils";

import { Stakeholders } from "../../../../../models/migration/controls/stakeholders";
import { button, SEC, trTag } from "../../../../../types/constants";
import { copy, selectBox } from "../../../../../views/applicationinventory.view";
import { Assessment } from "../../../../../models/migration/applicationinventory/assessment";
import { modal } from "../../../../../views/common.view";
import { closeModal } from "../../../../../views/assessment.view";

let stakeholdersList: Array<Stakeholders> = [];
let applicationList: Array<Assessment> = [];

describe(["@tier2"], "Copy assessment and review tests", () => {
    before("Login and Create Test Data", function () {
        login();

        // Create data
        stakeholdersList = createMultipleStakeholders(1);
        applicationList = createMultipleApplications(4);

        // Verify copy assessment is not enabled until assessment is done
        applicationList[0].verifyCopyAssessmentDisabled();

        // Perform assessment of application
        applicationList[0].perform_assessment("low", [stakeholdersList[0].name]);
        applicationList[0].verifyStatus("assessment", "Completed");

        // Perform application review
        applicationList[0].perform_review("low");
        applicationList[0].verifyStatus("review", "Completed");
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Copy assessment to self", function () {
        // Copy assessment to self, checkbox should be disabled
        applicationList[0].openCopyAssessmentModel();
        cy.get(".pf-m-compact> tbody > tr > td")
            .contains(applicationList[0].name)
            .parent(trTag)
            .within(() => {
                cy.get(selectBox).should("be.disabled");
                cy.wait(2 * SEC);
            });
        click(closeModal, false, true);
    });

    it("Copy button not enabled until one app is selected", function () {
        // Copy assessment to self, should be disabled
        applicationList[0].openCopyAssessmentModel();
        cy.get(copy).should("be.disabled");
        applicationList[0].selectApps(applicationList);
        cy.get(copy).should("not.be.disabled");
        click(closeModal, false, true);
    });

    it("Copy assessment to more than one application and discard assessment", function () {
        // Verify copy assessment is not enabled until assessment is done
        applicationList[1].verifyCopyAssessmentDisabled();

        // Perform copy assessment of all the applications
        applicationList[0].copy_assessment(applicationList);

        // Verify that all the applications were assessed
        for (let i = 1; i < applicationList.length; i++) {
            applicationList[i].verifyStatus("assessment", "Completed");
            applicationList[i].discard_assessment();
            applicationList[i].verifyStatus("assessment", "Not started");
        }
    });

    it("Copy assessment,review and discard assessment, review", function () {
        // Perform copy assessment and review of all the applications
        applicationList[0].copy_assessment_review(applicationList);

        // Verify that all the applications were assessed
        for (let i = 1; i < applicationList.length; i++) {
            applicationList[i].verifyStatus("assessment", "Completed");
            applicationList[i].verifyStatus("review", "Completed");

            // Discard assessment and review
            applicationList[i].discard_assessment();
            applicationList[i].verifyStatus("assessment", "Not started");
            applicationList[i].verifyStatus("review", "Not started");
        }
    });

    it("Copy assessment select options validations", function () {
        applicationList[0].openCopyAssessmentModel();

        // select 10 items per page
        applicationList[0].selectItemsPerPage(10);
        cy.wait(SEC);

        // Select all the applications on page
        cy.log("Selecting page...");
        clickWithin(modal, "button[aria-label='Select']");
        clickByText(button, "Select page", false, true);
        cy.get("div").then(($div) => {
            if ($div.text().includes("in-progress or complete assessment")) {
                selectCheckBox("#confirm-copy-checkbox");
            }
        });
        cy.get(copy).should("be.visible").should("not.be.disabled");

        // Select all applications
        cy.log("Selecting all...");
        clickWithin(modal, "button[aria-label='Select']", false, true);
        clickByText(button, "Select all", false, true);
        clickWithin(modal, "button[aria-label='Select']");
        cy.get(copy).should("be.visible").should("not.be.disabled");

        // Deselect all applications
        cy.log("Selecting none...");
        clickWithin(modal, "button[aria-label='Select']");
        clickByText(button, "Select none (0 items)", false, true);
        clickWithin(modal, "button[aria-label='Select']");
        cy.get(copy).should("be.visible").should("be.disabled");
        click(closeModal, false, true);
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(applicationList);
    });
});
