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

import { login, getRandomApplicationData, deleteByList } from "../../../../../utils/utils";

import * as data from "../../../../../utils/data_utils";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import {legacyPathfinder, cloudNative, SEC} from "../../../../types/constants";

const stakeholdersList: Array<Stakeholders> = [];
const stakeholdersNameList: Array<string> = [];
const yamlFileName = "questionnaire_import/cloud-native.yaml";

describe(["@tier1"], "Application assessment and review tests", () => {
    before("Login and Create Test Data", function () {
        login();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        AssessmentQuestionnaire.import(yamlFileName);
        AssessmentQuestionnaire.enable(cloudNative);
        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);
    });

    beforeEach("Interceptors", function () {
        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Application assessment and review with low risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new Assessment(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("low", stakeholdersNameList);
        cy.wait(2000);
        application.verifyStatus("assessment", "Completed");

        // Perform application review
        application.perform_review("low");
        cy.wait(2000);
        application.verifyStatus("review", "Completed");

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it(["@interop"], "Application assessment and review with medium risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new Assessment(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment(
            "medium",
            stakeholdersNameList,
            null,
            null,
            legacyPathfinder
        );
        cy.wait(2000);
        application.verifyStatus("assessment", "Completed");

        // Perform application review
        application.perform_review("medium");
        cy.wait(2000);
        application.verifyStatus("review", "Completed");

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it("Application assessment and review with high risk", function () {
        // Navigate to application inventory tab and create new application
        const application = new Assessment(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Perform assessment of application
        application.perform_assessment("high", stakeholdersNameList);
        cy.wait(2000);
        application.verifyStatus("assessment", "Completed");

        // Perform application review
        application.perform_review("high");
        cy.wait(2000);
        application.verifyStatus("review", "Completed");

        // Delete application
        application.delete();
        cy.wait(2000);
    });

    it("Application with multiple assessments", function () {
        const application = new Assessment(getRandomApplicationData());
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        application.perform_assessment("high", stakeholdersNameList);
        application.clickAssessButton();
        cy.wait(2 * SEC);
        cy.contains('tr', legacyPathfinder)
            .find('button.retake-button')
            .should('have.length', 1)

        application.perform_assessment("high", stakeholdersNameList, undefined, undefined, cloudNative);
        application.clickAssessButton();
        cy.wait(2 * SEC);
        cy.contains('tr', cloudNative)
            .find('button.retake-button')
            .should('have.length', 1)
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        AssessmentQuestionnaire.delete(cloudNative);
    });
});
