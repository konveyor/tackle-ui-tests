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
    deleteByList,
    clickItemInKebabMenu,
    clickByText,
    createMultipleStakeholders,
    click,
    clickJs,
    clickKebabMenuOptionArchetype,
} from "../../../../utils/utils";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import {
    confirmButton,
    nextButton,
    radioButton,
    radioButtonLabel,
    splitItem,
} from "../../../views/common.view";
import {
    legacyPathfinder,
    SEC,
    button,
    cloudReadinessQuestionnaire,
    cloudReadinessFilePath,
} from "../../../types/constants";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import * as data from "../../../../utils/data_utils";
import { questionBlock } from "../../../views/assessment.view";

let stakeholderList: Array<Stakeholders> = [];
let archetype: Archetype;

describe(["@tier3"], "Tests related to questionnaire features", () => {
    before("Import and enable Cloud readiness questionnaire template", function () {
        login();
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
        cy.wait(2 * SEC);
    });

    it("Test conditional questions during archetype assessment", function () {
        //Automates Polarion MTA-386: Test conditional questions
        archetype.clickAssessButton();
        Assessment.take_questionnaire(cloudReadinessQuestionnaire);
        Assessment.selectStakeholders(stakeholderList);
        clickJs(nextButton);
        cy.wait(SEC);
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
                cy.wait(2000);
            });
        archetype.discard("Discard assessment(s)");
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholderList);
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        archetype.delete();
    });
});
