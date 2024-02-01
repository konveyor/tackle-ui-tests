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
    exists,
    createMultipleStakeholderGroups,
    clickByText,
    selectFromDropListByText,
} from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { Tag } from "../../../../models/migration/controls/tags";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { legacyPathfinder, SEC } from "../../../../types/constants";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { customActionButton, ViewArchetypes } from "../../../../views/applicationinventory.view";
import { archetypeDropdown } from "../../../../views/archetype.view";

let applicationList: Array<Application> = [];
let archetypeList: Array<Archetype> = [];
let inheritenceTags: Tag[];
let assosiationTags: Tag[];
let stakeholderGroups: Stakeholdergroups[];
let stakeholders: Stakeholders[];

describe(["@tier2"], "Tests related to application-archetype association ", () => {
    before("Login", function () {
        login();
        inheritenceTags = createMultipleTags(2);
        assosiationTags = createMultipleTags(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
        stakeholders = createMultipleStakeholders(1);

        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
    });

    it("Archetype association - Application creation before archetype creation ", function () {
        // Automates Polarion MTA-400
        const appdata = {
            name: data.getAppName(),
            tags: ["Web / WebSocket"],
        };

        const application = new Application(appdata);
        applicationList.push(application);
        application.create();
        cy.wait(2 * SEC);

        const archetype = new Archetype(
            data.getRandomWord(8),
            ["Web / WebSocket"],
            ["Web / WebSocket"],
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

        archetypeList = createMultipleArchetypes(2, inheritenceTags);
        const archetypeNames = [archetypeList[0].name, archetypeList[1].name];

        const appdata = {
            name: data.getAppName(),
            tags: [inheritenceTags[0].name, inheritenceTags[1].name],
        };

        const application2 = new Application(appdata);
        applicationList.push(application2);
        application2.create();
        cy.wait(2 * SEC);

        // Note that the application is associated with 2 archetypes. Its 'Assessment' and 'Review'
        // status show 'In progress' until all associated archetypes have been assessed.
        application2.verifyArchetypeList(archetypeNames, "Associated archetypes");
        application2.verifyStatus("review", "Not started");
        archetypeList[0].perform_review("low");
        application2.verifyStatus("review", "In-progress");
        archetypeList[1].perform_review("medium");
        application2.verifyStatus("review", "Completed");

        // Validate 'Reviews' field on app drawer after review inheritance
        application2.validateInheritedReviewFields(archetypeNames);

        // Assert that 'Archetypes reviewed' is populated on app drawer after review inheritance
        application2.verifyArchetypeList(archetypeNames, "Archetypes reviewed");

        // Verify assessment inheritance from multiple archetypes
        application2.verifyStatus("assessment", "Not started");
        archetypeList[0].perform_assessment("low", stakeholders);
        application2.verifyStatus("assessment", "In-progress");
        application2.validateAssessmentField("Unknown");
        archetypeList[1].perform_assessment("medium", stakeholders);

        application2.verifyStatus("assessment", "Completed");
        application2.verifyArchetypeList(archetypeNames, "Archetypes assessed");
        application2.validateAssessmentField("Medium");
    });

    it("View Archetypes from application assessment popup", function () {
        // Automates Polarion MTA-436

        const archetype1 = new Archetype(
            data.getRandomWord(8),
            [assosiationTags[0].name],
            [assosiationTags[1].name],
            null,
            stakeholders,
            stakeholderGroups
        );

        archetype1.create();
        exists(archetype1.name);

        archetype1.perform_assessment("low", stakeholders);
        cy.wait(2 * SEC);

        archetype1.validateAssessmentField("Low");

        const archetype2 = new Archetype(
            data.getRandomWord(8),
            [assosiationTags[0].name],
            [assosiationTags[1].name],
            null,
            stakeholders,
            stakeholderGroups
        );

        archetype2.create();
        exists(archetype2.name);

        archetype2.perform_assessment("low", stakeholders);
        cy.wait(2 * SEC);

        archetype2.validateAssessmentField("Low");

        const appdata = {
            name: data.getAppName(),
            tags: assosiationTags.map((tag) => tag.name),
        };

        const application = new Application(appdata);

        applicationList.push(application);
        application.create();
        cy.wait(2 * SEC);

        application.clickAssessButton();

        clickByText(customActionButton, ViewArchetypes);

        selectFromDropListByText(archetypeDropdown, archetype1.name);
        cy.wait(SEC);

        selectFromDropListByText(archetypeDropdown, archetype2.name);

        archetype1.delete();
        archetype2.delete();
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationList);
        deleteByList(archetypeList);
        deleteByList(inheritenceTags);
        deleteByList(assosiationTags);
        deleteByList(stakeholders);
    });
});
