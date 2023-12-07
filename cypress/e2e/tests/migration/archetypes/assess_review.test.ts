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
    createMultipleTags,
    createMultipleStakeholders,
    deleteByList,
} from "../../../../utils/utils";

import * as data from "../../../../utils/data_utils";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { legacyPathfinder, SEC } from "../../../types/constants";
import { Tag } from "../../../models/migration/controls/tags";

let stakeholders: Stakeholders[];
let tags: Tag[];

describe(["@tier1"], "Archetype assessment tests", () => {
    before("Login and Create Test Data", function () {
        login();
        AssessmentQuestionnaire.deleteAllQuesionnaire();
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholders = createMultipleStakeholders(1);
        tags = createMultipleTags(2);
    });

    it("Archetype assessment with low risk", function () {
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        archetype.create();
        cy.wait(2 * SEC);

        archetype.perform_assessment("low", stakeholders);
        cy.wait(2 * SEC);
        archetype.validateAssessmentField();

        archetype.delete();
        cy.wait(2 * SEC);
    });

    it("Archetype assessment with medium risk", function () {
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        archetype.create();
        cy.wait(2 * SEC);

        archetype.perform_assessment("medium", stakeholders);
        cy.wait(2 * SEC);
        archetype.validateAssessmentField();

        archetype.delete();
        cy.wait(2 * SEC);
    });

    it("Archetype assessment with high risk", function () {
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        archetype.create();
        cy.wait(2 * SEC);

        archetype.perform_assessment("high", stakeholders);
        cy.wait(2 * SEC);
        archetype.validateAssessmentField();

        archetype.delete();
        cy.wait(2 * SEC);
    });

    after("Clear test data", function () {
        deleteByList(stakeholders);
        deleteByList(tags);
    });
});
