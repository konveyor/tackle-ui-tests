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
    clickByText,
    createMultipleApplications,
    createMultipleArchetypes,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    login,
    selectFromDropListByText,
} from "../../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Tag } from "../../../../models/migration/controls/tags";
import {
    cloudReadinessFilePath,
    cloudReadinessQuestionnaire,
    legacyPathfinder,
} from "../../../../types/constants";
import { customActionButton, ViewArchetypes } from "../../../../views/applicationinventory.view";
import { archetypeDropdown } from "../../../../views/archetype.view";

let applicationList: Application[];
let inheritanceTags: Tag[];
let associationTags: Tag[];
let stakeholders: Stakeholders[];
describe(["@tier3"], "Tests related to application-archetype association ", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        inheritanceTags = createMultipleTags(2);
        associationTags = createMultipleTags(2);
        stakeholders = createMultipleStakeholders(1);

        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
    });

    it("tackle2-ui Issue 2400: Verify multiple applications inherit assessment and review inheritance from an archetype", function () {
        // Automates Polarion MTA-400 Archetype association - Application creation before archetype creation.
        AssessmentQuestionnaire.import(cloudReadinessFilePath);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
        applicationList = createMultipleApplications(2, [inheritanceTags[0].name]);

        const archetype = new Archetype(
            data.getRandomWord(8),
            [inheritanceTags[0].name],
            [inheritanceTags[1].name],
            null
        );
        archetype.create();

        /*Automates Polarion MTA-499 Verify multiple applications inherit assessment and review inheritance from an archetype
          and Polarion MTA-2464 Assess archetype with multiple questionnaires */
        archetype.perform_review("low");
        archetype.verifyStatus("review", "Completed");
        archetype.verifyStatus("assessment", "Not started");
        archetype.perform_assessment("low", stakeholders);
        // 'Archetype risk' field shows unassessed until all required questionnaires have been taken.
        archetype.validateAssessmentField("Unassessed");
        archetype.clickAssessButton();
        cy.contains("tr", legacyPathfinder).find("button.retake-button").should("have.length", 1);

        Archetype.open(true);
        archetype.verifyStatus("assessment", "In-progress");
        archetype.perform_assessment("medium", stakeholders, null, cloudReadinessQuestionnaire);
        archetype.validateAssessmentField("Medium");
        archetype.verifyStatus("assessment", "Completed");
        archetype.clickAssessButton();
        cy.contains("tr", cloudReadinessQuestionnaire)
            .find("button.retake-button")
            .should("have.length", 1);

        for (let i = 0; i < applicationList.length; i++) {
            // Assert that associated archetypes are listed on app drawer after application gets associated with archetype(s)
            applicationList[i].verifyArchetypeList([archetype.name], "Associated archetypes");
            applicationList[i].verifyArchetypeList([archetype.name], "Archetypes reviewed");
            applicationList[i].validateInheritedReviewFields([archetype.name]);
            applicationList[i].verifyStatus("review", "Completed");
            applicationList[i].verifyInheritanceStatus("review");
            applicationList[i].verifyArchetypeList([archetype.name], "Archetypes assessed");
            applicationList[i].validateAssessmentField("Medium");
            applicationList[i].verifyStatus("assessment", "Completed");
            applicationList[i].verifyInheritanceStatus("assessment");
        }

        archetype.delete();
        AssessmentQuestionnaire.delete(cloudReadinessQuestionnaire);
    });

    it("tackle2-ui Issue 2400: Verify application assessment and review inheritance from multiple archetypes ", function () {
        /* Automates MTA-420
        This also verifies: Archetype association - Application creation after archetype creation.
        */

        const archetypeList = createMultipleArchetypes(2, inheritanceTags);
        const archetypeNames = [archetypeList[0].name, archetypeList[1].name];

        const appdata = {
            name: data.getAppName(),
            tags: [inheritanceTags[0].name, inheritanceTags[1].name],
        };

        const application2 = new Application(appdata);
        applicationList.push(application2);
        application2.create();

        // Note that the application is associated with 2 archetypes. Its 'Assessment' and 'Review'
        // status show 'In-progress' until all associated archetypes have been assessed.
        application2.verifyArchetypeList(archetypeNames, "Associated archetypes");
        application2.verifyStatus("review", "Not started");
        archetypeList[0].perform_review("low");
        application2.verifyStatus("review", "In-progress");
        archetypeList[1].perform_review("medium");
        application2.verifyStatus("review", "Completed");
        application2.verifyInheritanceStatus("review");

        // Validate 'Reviews' field on app drawer after review inheritance
        application2.validateInheritedReviewFields(archetypeNames);

        // Assert that 'Archetypes reviewed' is populated on app drawer after review inheritance
        application2.verifyArchetypeList(archetypeNames, "Archetypes reviewed");

        // Verify assessment inheritance from multiple archetypes
        application2.verifyStatus("assessment", "Not started");
        archetypeList[0].perform_assessment("low", stakeholders);
        application2.verifyStatus("assessment", "In-progress");
        application2.validateAssessmentField("Unassessed");
        archetypeList[1].perform_assessment("medium", stakeholders);

        application2.verifyStatus("assessment", "Completed");
        application2.verifyArchetypeList(archetypeNames, "Archetypes assessed");
        application2.validateAssessmentField("Medium");
        application2.verifyInheritanceStatus("assessment");

        // Application Assessment and Review status should show 'Not started' when
        // archetype assessment and review are discarded.
        for (let i = 0; i < archetypeList.length; i++) {
            archetypeList[i].discard("Discard review");
            archetypeList[i].discard("Discard assessment(s)");
        }
        application2.verifyStatus("assessment", "Not started");
        application2.verifyStatus("review", "Not started");

        deleteByList(archetypeList);
    });

    it("tackle2-ui Issue 2400: View Archetypes from application assessment popup", function () {
        // Automates Polarion MTA-436

        const archetypeList = createMultipleArchetypes(2, associationTags);

        AssessmentQuestionnaire.import(cloudReadinessFilePath);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
        AssessmentQuestionnaire.disable(legacyPathfinder);

        for (let i = 0; i < archetypeList.length; i++) {
            archetypeList[i].perform_assessment(
                "low",
                stakeholders,
                null,
                cloudReadinessQuestionnaire
            );
            Archetype.open(true);
            archetypeList[i].verifyStatus("assessment", "Completed");
        }

        const appdata = {
            name: data.getAppName(),
            tags: associationTags.map((tag) => tag.name),
        };

        const application = new Application(appdata);
        applicationList.push(application);
        application.create();
        application.clickAssessButton();

        clickByText(customActionButton, ViewArchetypes);
        selectFromDropListByText(archetypeDropdown, archetypeList[0].name);
        selectFromDropListByText(archetypeDropdown, archetypeList[1].name);

        deleteByList(archetypeList);
    });

    after("Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationList);
        deleteByList(inheritanceTags);
        deleteByList(associationTags);
        deleteByList(stakeholders);
    });
});
