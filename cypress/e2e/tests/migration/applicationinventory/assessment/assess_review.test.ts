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
    getRandomApplicationData,
    deleteByList,
    clickByText,
    createMultipleStakeholders,
} from "../../../../../utils/utils";

import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { legacyPathfinder, cloudNative, SEC } from "../../../../types/constants";
import {
    modalBoxDialog,
    modalBoxMessage,
    reviewConfirmationText,
} from "../../../../views/applicationinventory.view";
import { confirmCancelButton } from "../../../../views/common.view";
import { Application } from "../../../../models/migration/applicationinventory/application";

let stakeholders: Stakeholders[];
const yamlFile = "questionnaire_import/cloud-native.yaml";

describe(["@tier2"], "Application assessment and review tests", () => {
    before("Login and Create Test Data", function () {
        login();
        // This test will fail if there are preexisting questionnaire.
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholders = createMultipleStakeholders(1);
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Validate application assessment and review with low risk and donut chart on review page", function () {
        //Polarion MTA-517 - Verify donut chart on applications review page
        const application = new Application(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);

        // Perform assessment of application
        application.perform_assessment("low", stakeholders);
        cy.wait(2 * SEC);
        application.verifyStatus("assessment", "Completed");
        application.validateAssessmentField("Low");

        application.validateReviewDonutChart();

        // Perform application review
        application.perform_review("low");
        cy.wait(2 * SEC);
        application.verifyStatus("review", "Completed");
        application.validateReviewFields();

        application.delete();
        cy.wait(2 * SEC);
    });

    it("Application assessment and review with medium risk", function () {
        const application = new Application(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);

        // Perform assessment of application
        application.perform_assessment("medium", stakeholders);
        cy.wait(2 * SEC);
        application.verifyStatus("assessment", "Completed");
        application.validateAssessmentField("Medium");

        // Perform application review
        application.perform_review("medium");
        cy.wait(2 * SEC);
        application.verifyStatus("review", "Completed");
        application.validateReviewFields();

        application.delete();
        cy.wait(2 * SEC);
    });

    it("Application assessment and review with high risk", function () {
        const application = new Application(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);

        // Perform assessment of application
        application.perform_assessment("high", stakeholders);
        cy.wait(2 * SEC);
        application.verifyStatus("assessment", "Completed");
        application.validateAssessmentField("High");

        // Perform application review
        application.perform_review("high");
        cy.wait(2 * SEC);
        application.verifyStatus("review", "Completed");
        application.validateReviewFields();

        application.delete();
        cy.wait(2 * SEC);
    });

    it("Perform application review during assessment", function () {
        // Polarion TC MTA-422
        const application = new Application(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);

        application.perform_assessment("high", stakeholders, null, legacyPathfinder, true);
        cy.wait(2 * SEC);

        application.perform_review("high");
        cy.wait(2 * SEC);

        application.verifyStatus("assessment", "Completed");
        application.verifyStatus("review", "Completed");
        application.validateReviewFields();

        // Automates bug: https://issues.redhat.com/browse/MTA-1751
        application.clickReviewButton();
        cy.get(modalBoxDialog).find(modalBoxMessage).should("contain.text", reviewConfirmationText);
        clickByText(confirmCancelButton, "Cancel");

        application.delete();
    });

    it("Application with multiple assessments", function () {
        // Polarion TC MTA-382
        AssessmentQuestionnaire.import(yamlFile);
        AssessmentQuestionnaire.enable(cloudNative);

        const application = new Application(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);

        application.perform_assessment("high", stakeholders);
        cy.wait(2 * SEC);
        application.verifyStatus("assessment", "In-progress");
        application.clickAssessButton();
        cy.contains("tr", legacyPathfinder).find("button.retake-button").should("have.length", 1);

        application.perform_assessment("high", stakeholders, null, cloudNative);
        cy.wait(2 * SEC);
        application.verifyStatus("assessment", "Completed");
        application.clickAssessButton();
        cy.contains("tr", cloudNative).find("button.retake-button").should("have.length", 1);

        application.delete();
        cy.wait(2 * SEC);

        AssessmentQuestionnaire.delete(cloudNative);
        cy.wait(2 * SEC);
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholders);
    });
});
