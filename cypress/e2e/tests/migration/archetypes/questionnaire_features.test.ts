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

import * as data from "../../../../utils/data_utils";
import {
    clickByText,
    clickJs,
    createMultipleStakeholders,
    deleteByList,
    login,
} from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import {
    button,
    cloudReadinessFilePath,
    cloudReadinessQuestionnaire,
    legacyPathfinder,
} from "../../../types/constants";
import { questionBlock } from "../../../views/assessment.view";
import { nextButton, radioButton, radioButtonLabel, splitItem } from "../../../views/common.view";

let stakeholderList: Array<Stakeholders> = [];
let archetype: Archetype;

describe(["@tier3"], "Tests for archetype questionnaire features", () => {
    before("Import and enable Cloud readiness questionnaire template", function () {
        login();
        cy.visit("/");
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.disable(legacyPathfinder);
        AssessmentQuestionnaire.import(cloudReadinessFilePath);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
        stakeholderList = createMultipleStakeholders(1);

        archetype = new Archetype(
            data.getRandomWord(8),
            ["Language / Java", "Runtime / Quarkus"],
            ["Language / Java"],
            null
        );
        archetype.create();
    });

    it("Test conditional questions during archetype assessment", function () {
        //Automates Polarion MTA-386: Test conditional questions
        archetype.clickAssessButton();
        Assessment.take_questionnaire(cloudReadinessQuestionnaire);
        Assessment.selectStakeholdersAndGroups(stakeholderList);
        clickJs(nextButton);
        cy.get(questionBlock)
            .eq(0)
            .then(($question) => {
                cy.wrap($question)
                    .children()
                    .find(splitItem)
                    .then(($questionLine) => {
                        expect($questionLine.text()).equal(
                            "What is the main technology in your application?",
                            "Conditional question missing"
                        );
                    });
                Assessment.clickRadioOption($question, 1);
            });
        clickByText(button, "Cancel");
        Archetype.open(true);
        archetype.discard("Discard assessment(s)");
    });

    it("Bug MTA-3417: Archetypes: 1) Test auto answer feature of questionnaires; 2) Save assessment", function () {
        //Automates Polarion MTA-388: Auto answer
        archetype.clickAssessButton();
        Assessment.take_questionnaire(cloudReadinessQuestionnaire);
        Assessment.selectStakeholdersAndGroups(stakeholderList);
        clickJs(nextButton);

        cy.get(splitItem)
            .contains("What is the main technology in your application?")
            .closest(questionBlock)
            .within(() => {
                cy.get(radioButtonLabel)
                    .contains("Quarkus")
                    .parent()
                    .within(() => {
                        cy.get(radioButton).invoke("is", ":checked");
                    });

                // Even when an answer is auto selected, it should be possible to select other answer choices.
                cy.get(radioButtonLabel)
                    .contains("Spring Boot")
                    .parent()
                    .within(() => {
                        cy.get(radioButton).click();
                    });
            });

        // Automates Polarion MTA-516: Save archetype assessment
        clickByText(button, "Save as draft");
        archetype.verifyButtonEnabled("Continue");
        clickByText(button, "Continue");
        clickJs(nextButton);
        cy.get(splitItem)
            .contains("What is the main technology in your application?")
            .closest(questionBlock)
            .within(() => {
                cy.get(radioButtonLabel)
                    .contains("Spring Boot")
                    .parent()
                    .within(() => {
                        // Verify selection from first take is saved
                        cy.get(radioButton).invoke("is", ":checked");
                    });
            });
        clickByText(button, "Save as draft");
        Archetype.open(true);
        archetype.discard("Discard assessment(s)");
    });

    after("Perform test data clean up", function () {
        Archetype.open(true);
        archetype.delete();
        Stakeholders.openList(true);
        deleteByList(stakeholderList);
        AssessmentQuestionnaire.open(true);
        AssessmentQuestionnaire.deleteAllQuestionnaires();
    });
});
