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

import * as data from "../../../../../utils/data_utils";
import {
    login,
    createMultipleTags,
    createMultipleArchetypes,
    deleteByList,
    createMultipleStakeholders,
} from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { Tag } from "../../../../models/migration/controls/tags";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { legacyPathfinder, SEC } from "../../../../types/constants";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";

let applicationList: Array<Application> = [];
let archetypeList: Array<Archetype> = [];
let tags: Tag[];
let stakeholders: Stakeholders[];

describe(["@tier2"], "Tests related to application-archetype association ", () => {
    before("Login", function () {
        login();
        tags = createMultipleTags(2);
        stakeholders = createMultipleStakeholders(1);

        AssessmentQuestionnaire.deleteAllQuesionnaire();
        AssessmentQuestionnaire.enable(legacyPathfinder);
    });

    it("Archetype association - Application creation before archetype creation ", function () {
        // Automates Polarion MTA-400
        const appdata = {
            name: data.getAppName(),
            tags: [tags[0].name],
        };

        const application = new Application(appdata);
        applicationList.push(application);
        application.create();
        cy.wait(2 * SEC);

        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null
        );
        archetype.create();
        cy.wait(2 * SEC);

        // Assert that associated archetypes are listed on app drawer after application gets associated with archetype(s)
        application.verifyArchetypeList([archetype.name], "Associated archetypes");
        archetype.delete();
    });

    it("Verify application assessment and review inheritance from multiple archetypes ", function () {
        /* Automates MTA-420
        This also verifies: Archetype association - Application creation after archetype creation.
        */

        archetypeList = createMultipleArchetypes(2, tags);
        const archetypeNames = [archetypeList[0].name, archetypeList[1].name];

        const appdata = {
            name: data.getAppName(),
            tags: [tags[0].name, tags[1].name],
        };

        const application = new Application(appdata);
        applicationList.push(application);
        application.create();
        cy.wait(2 * SEC);

        // Note that the application is associated with 2 archetypes. Its 'Assessment' and 'Review'
        // status show 'In progress' until all associated archetypes have been assessed.
        application.verifyArchetypeList(["None"], "Archetypes reviewed");
        application.verifyStatus("review", "Not started");
        archetypeList[0].perform_review("low");
        application.verifyStatus("review", "In-progress");
        archetypeList[1].perform_review("medium");
        application.verifyStatus("review", "Completed");

        // Validate 'Reviews' field on app drawer after review inheritance
        application.validateInheritedReviewFields(archetypeNames);

        // Assert that 'Archetypes reviewed' is populated on app drawer after review inheritance
        application.verifyArchetypeList(archetypeNames, "Archetypes reviewed");

        // Verify assessment inheritance from multiple archetypes
        application.verifyStatus("assessment", "Not started");
        archetypeList[0].perform_assessment("low", stakeholders);
        application.verifyStatus("assessment", "In-progress");
        application.validateAssessmentField("Unknown");
        archetypeList[1].perform_assessment("medium", stakeholders);

        application.verifyStatus("assessment", "Completed");
        application.verifyArchetypeList(archetypeNames, "Archetypes assessed");
        application.validateAssessmentField("High");
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationList);
        deleteByList(archetypeList);
        deleteByList(tags);
        deleteByList(stakeholders);
    });
});
