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
    createMultipleApplications,
    deleteByList,
    checkSuccessAlert,
    getRandomApplicationData,
    clickItemInKebabMenu,
    clickByText,
    createMultipleStakeholders,
    createMultipleTags,
    createMultipleArchetypes,
    click,
} from "../../../../../utils/utils";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { alertTitle, confirmButton } from "../../../../views/common.view";
import { legacyPathfinder, cloudNative, SEC, button } from "../../../../types/constants";
import {
    ArchivedQuestionnaires,
    ArchivedQuestionnairesTableDataCell,
} from "../../../../views/assessmentquestionnaire.view";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import * as data from "../../../../../utils/data_utils";

const fileName = "Legacy Pathfinder";
let stakeholderList: Array<Stakeholders> = [];
let applicationList: Array<Application> = [];
const yamlFile = "questionnaire_import/cloud-native.yaml";

describe(["@tier3"], "Tests related to application assessment and review", () => {
    before("Perform application assessment and review", function () {
        login();
        cy.intercept("GET", "/hub/application*").as("getApplication");

        AssessmentQuestionnaire.enable(fileName);
        stakeholderList = createMultipleStakeholders(1);

        applicationList = createMultipleApplications(1);
        applicationList[0].perform_assessment("low", stakeholderList);
        cy.wait(2000);
        applicationList[0].verifyStatus("assessment", "Completed");
        applicationList[0].perform_review("low");
        cy.wait(2000);
        applicationList[0].verifyStatus("review", "Completed");
    });

    it("Retake Assessment questionnaire", function () {
        clickItemInKebabMenu(applicationList[0].name, "Assess");
        cy.wait(SEC);
        clickByText(button, "Retake");
        checkSuccessAlert(
            alertTitle,
            `Success alert:Success! Assessment discarded for ${applicationList[0].name}.`
        );
        Assessment.fill_assessment_form("low", stakeholderList);
        applicationList[0].verifyStatus("assessment", "Completed");
    });

    it("Discard Assessment", function () {
        applicationList[0].selectKebabMenuItem("Discard assessment(s)");
        checkSuccessAlert(
            alertTitle,
            `Success alert:Success! Assessment discarded for ${applicationList[0].name}.`
        );
        applicationList[0].verifyStatus("assessment", "Not started");
    });

    it("Discard Review", function () {
        applicationList[0].selectKebabMenuItem("Discard review");
        checkSuccessAlert(
            alertTitle,
            `Success alert:Success! Review discarded for ${applicationList[0].name}.`
        );
        applicationList[0].verifyStatus("review", "Not started");
    });
    it("Assess application and overide assessment for that archetype", function () {
        // Polarion TC MTA-390
        const archetypesList = [];
        const tags = createMultipleTags(2);
        const archetype1 = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null
        );
        archetype1.create();
        cy.wait(2 * SEC);
        archetypesList.push(archetype1);
        const appdata = {
            name: data.getAppName(),
            description: data.getDescription(),
            tags: [tags[0].name],
            comment: data.getDescription(),
        };

        const application1 = new Application(appdata);
        applicationList.push(application1);
        application1.create();
        cy.wait(2 * SEC);
        archetype1.perform_assessment("low", stakeholderList);
        application1.clickAssessButton();
        application1.validateOverrideAssessmentMessage(archetypesList);
        click(confirmButton);
        cy.contains("button", "Take", { timeout: 30 * SEC }).should(
            "not.have.attr",
            "aria-disabled",
            "true"
        );
        deleteByList(tags);
        deleteByList(archetypesList);
    });

    it("View archived questionnaire", function () {
        // Polarion TC MTA-392
        const application = new Application(getRandomApplicationData());
        application.create();
        cy.wait(2 * SEC);

        application.perform_assessment("high", stakeholderList);
        cy.wait(2 * SEC);

        application.verifyStatus("assessment", "Completed");
        AssessmentQuestionnaire.disable(legacyPathfinder);
        application.clickAssessButton();

        cy.contains("table", ArchivedQuestionnaires)
            .find(ArchivedQuestionnairesTableDataCell)
            .should("have.text", legacyPathfinder);

        AssessmentQuestionnaire.import(yamlFile);
        AssessmentQuestionnaire.disable(cloudNative);

        application.clickAssessButton();
        cy.contains("table", ArchivedQuestionnaires)
            .find(ArchivedQuestionnairesTableDataCell)
            .last()
            .should("not.have.text", cloudNative);
        // todo: uncomment when the bug is fixed
        // AssessmentQuestionnaire.delete(cloudNative);
    });

    it("Assess and review application associated with unassessed/unreviewed archetypes", function () {
        // Polarion TC MTA-456
        const tags = createMultipleTags(2);
        const archetypeList = createMultipleArchetypes(2, tags);

        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);

        const appdata = {
            name: data.getAppName(),
            tags: [tags[0].name, tags[1].name],
        };
        const application2 = new Application(appdata);
        application2.create();
        cy.wait(2 * SEC);

        application2.perform_assessment("medium", stakeholderList);
        cy.wait(2 * SEC);
        application2.verifyStatus("assessment", "Completed");
        application2.validateAssessmentField("Medium");

        application2.perform_review("medium");
        cy.wait(2 * SEC);
        application2.verifyStatus("review", "Completed");
        application2.validateReviewFields();

        application2.delete();
        cy.wait(2 * SEC);
        deleteByList(tags);
        deleteByList(archetypeList);
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholderList);
        deleteByList(applicationList);
        AssessmentQuestionnaire.delete(cloudNative);
    });
});
