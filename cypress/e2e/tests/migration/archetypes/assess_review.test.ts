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
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    login,
} from "../../../../utils/utils";

import * as data from "../../../../utils/data_utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Tag } from "../../../models/migration/controls/tags";
import { legacyPathfinder } from "../../../types/constants";

let stakeholders: Stakeholders[];
let tags: Tag[];

describe(["@tier2"], "Archetype assessment and review tests", () => {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholders = createMultipleStakeholders(1);
        tags = createMultipleTags(2);
    });

    it("Validate archetype assessment and review with low risk and donut chart on review page", function () {
        //Polarion MTA-518 - Verify donut chart on archetype review page
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        Archetype.open(true);
        archetype.create();

        archetype.verifyStatus("assessment", "Not started");
        archetype.perform_assessment("low", stakeholders);
        Archetype.open(true);
        archetype.validateAssessmentField("Low");
        archetype.verifyStatus("assessment", "Completed");

        archetype.validateReviewDonutChart();

        Archetype.open(true);
        archetype.verifyStatus("review", "Not started");
        archetype.perform_review("low");
        archetype.verifyStatus("review", "Completed");
        archetype.validateReviewFields();

        archetype.delete();
    });

    it("Archetype assessment and review with medium risk", function () {
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        archetype.create();
        archetype.perform_assessment("medium", stakeholders);
        archetype.validateAssessmentField("Medium");
        archetype.perform_review("medium");
        archetype.validateReviewFields();
        archetype.delete();
    });

    it("Archetype assessment and review with high risk", function () {
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        archetype.create();
        archetype.perform_assessment("high", stakeholders);
        archetype.validateAssessmentField("High");

        archetype.perform_review("high");
        archetype.validateReviewFields();
        archetype.delete();
    });

    after("Clear test data", function () {
        deleteByList(stakeholders);
        deleteByList(tags);
    });
});
