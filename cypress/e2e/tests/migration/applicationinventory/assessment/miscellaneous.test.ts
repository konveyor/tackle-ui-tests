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
import { alertTitle, confirmButton, successAlertMessage } from "../../../../views/common.view";
import {
    legacyPathfinder,
    cloudNative,
    SEC,
    button,
    cloudReadinessFilePath,
    cloudReadinessQuestionnaire,
} from "../../../../types/constants";
import {
    ArchivedQuestionnaires,
    ArchivedQuestionnairesTableDataCell,
} from "../../../../views/assessmentquestionnaire.view";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import * as data from "../../../../../utils/data_utils";

let stakeholderList: Array<Stakeholders> = [];
let applicationList: Array<Application> = [];
let archetypeList: Archetype[];

const yamlFile = "questionnaire_import/cloud-native.yaml";

describe(["@tier3"], "Tests related to application assessment and review", () => {
    before("Perform application assessment and review", function () {
        login();
        cy.intercept("GET", "/hub/application*").as("getApplication");

        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholderList = createMultipleStakeholders(1);
        archetypeList = createMultipleArchetypes(1);

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

    it("Bug MTA-2503: Discard application assessment from kebabMenu, Assessment actions Page", function () {
        // Automates Polarion MTA-418 Discard assessment from kebab menu
        applicationList[0].selectKebabMenuItem("Discard assessment(s)");
        checkSuccessAlert(
            alertTitle,
            `Success alert:Success! Assessment discarded for ${applicationList[0].name}.`
        );
        applicationList[0].verifyStatus("assessment", "Not started");

        // Automates Polarion MTA-440 Delete assessment from Assessment actions Page
        applicationList[0].perform_assessment("low", stakeholderList);
        Application.open(true);
        applicationList[0].deleteAssessments();
        applicationList[0].verifyButtonEnabled("Take");
        checkSuccessAlert(
            successAlertMessage,
            `Success! Assessment discarded for ${applicationList[0].name}.`,
            true
        );
        applicationList[0].validateAssessmentField("Unknown");
        archetypeList[0].perform_assessment("low", stakeholderList);
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
        cy.contains("button", "Take", { timeout: 70 * SEC }).should(
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

    it(
        ["@interop", "@tier0"],
        "Test inheritance after discarding application assessment and review",
        function () {
            // Polarion TC MTA-456 Assess and review application associated with unassessed/unreviewed archetypes
            const tags = createMultipleTags(2);
            const archetypes = createMultipleArchetypes(2, tags);

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

            // Polarion TC 496 Verify assessment and review inheritance after discarding application assessment and review
            archetypes[0].perform_review("low");
            application2.validateReviewFields(); // Application should retain its individual review.

            archetypes[0].perform_assessment("low", stakeholderList);
            application2.validateAssessmentField("Medium"); // Application should retain its individual assessment.

            archetypes[1].delete(); // Disassociate app from archetypes[1].name

            // Inheritance happens only after application assessment/review is discarded.
            application2.selectKebabMenuItem("Discard review");
            application2.validateInheritedReviewFields([archetypes[0].name]);

            application2.selectKebabMenuItem("Discard assessment");
            application2.validateAssessmentField("Low");
            application2.verifyStatus("assessment", "Completed");

            application2.delete();
            cy.wait(2 * SEC);
            archetypes[0].delete();
            deleteByList(tags);
        }
    );

    it("Test application association when an archetype contains a subset  of the tags of another  archetype", function () {
        // Automates Polarion TC MTA-501
        const tags = createMultipleTags(5);
        const tagNames = [tags[0].name, tags[1].name, tags[2].name, tags[3].name, tags[4].name];
        const application = createMultipleApplications(1, tagNames);
        let archetypes: Archetype[] = [];

        const archetype1 = new Archetype(
            data.getRandomWord(8),
            [tags[0].name, tags[1].name, tags[2].name],
            [tags[1].name],
            null
        );
        archetype1.create();
        archetypes.push(archetype1);
        cy.wait(2 * SEC);

        const archetype2 = new Archetype(
            data.getRandomWord(8),
            [tags[0].name, tags[1].name, tags[2].name],
            [tags[1].name],
            null
        );
        archetype2.create();
        archetypes.push(archetype2);
        cy.wait(2 * SEC);

        const archetype3 = new Archetype(
            data.getRandomWord(8),
            [tags[3].name, tags[4].name],
            [tags[1].name],
            null
        );
        archetype3.create();
        archetypes.push(archetype3);
        cy.wait(2 * SEC);

        application[0].verifyArchetypeList(
            [archetype1.name, archetype2.name, archetype3.name],
            "Associated archetypes"
        );

        deleteByList(application);
        deleteByList(archetypes);
        deleteByList(tags);
    });

    it("BUG MTA-2505: Deletes assessments from archived questionnaire associated with an archetype and an application", function () {
        //automates polarion MTA-441 and MTA-442
        const applications = createMultipleApplications(1);
        const archetypes = createMultipleArchetypes(1);

        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        applications[0].perform_assessment("low", stakeholderList);
        AssessmentQuestionnaire.disable(legacyPathfinder);
        applications[0].verifyStatus("assessment", "Not started");
        applications[0].validateAssessmentField("Unknown");
        applications[0].deleteAssessments();
        applications[0].verifyStatus("assessment", "Not started");

        AssessmentQuestionnaire.enable(legacyPathfinder);
        archetypes[0].perform_assessment("low", stakeholderList);
        AssessmentQuestionnaire.disable(legacyPathfinder);
        archetypes[0].validateAssessmentField("Unknown");
        archetypes[0].deleteAssessments();

        AssessmentQuestionnaire.enable(legacyPathfinder);
        deleteByList(applications);
        deleteByList(archetypes);
    });

    it("Validates auto tagging of applications and archetypes based on assessment answers", function () {
        //automates polarion MTA-387 and MTA-502
        const archetypeTag = ["3rd party", "Apache Aries"];
        const assessmentTag = ["Runtime", "Spring Boot"];
        const appdata = { name: "test1", tags: ["Language / Java"] };
        const application = new Application(appdata);
        application.create();

        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.import(cloudReadinessFilePath);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
        AssessmentQuestionnaire.disable(legacyPathfinder);

        application.perform_assessment(
            "medium",
            stakeholderList,
            null,
            cloudReadinessQuestionnaire
        );

        // Automates Polarion MTA-519 Validate application tag filtration
        application.validateTagsCount("2");
        application.filterTags("assessment"); // Verify assessment tag is applied to application
        application.tagAndCategoryExists([assessmentTag]);
        application.tagAndCategoryDontExist([archetypeTag, ["Language", "C"]]);
        application.closeApplicationDetails();

        // Assessment tag should get discarded after application assessment is discarded
        application.selectKebabMenuItem("Discard assessment(s)");
        application.applicationDetailsTab("Tags");
        application.tagAndCategoryDontExist([assessmentTag]);
        application.closeApplicationDetails();
        application.closeApplicationDetails();

        // Automates Polarion MTA-502
        const archetype = new Archetype(
            data.getRandomWord(8),
            ["Language / Java"],
            ["3rd party / Apache Aries"],
            null
        );
        archetype.create();
        archetype.perform_assessment("medium", stakeholderList, null, cloudReadinessQuestionnaire);
        Archetype.open(true);
        archetype.validateTagsColumn(["Spring Boot"]);
        archetype.assertsTagsMatch("Assessment Tags", ["Spring Boot"], true, true);
        const appdata2 = { name: "test2", tags: ["Language / Java"] };
        const application2 = new Application(appdata2);
        application2.create();

        // Verify archetype tag and assessment tag are present on application details page
        application2.filterTags("archetype");
        application2.tagAndCategoryExists([archetypeTag]);
        application2.tagAndCategoryDontExist([assessmentTag, ["Language", "Java"]]);
        application2.closeApplicationDetails();

        application2.filterTags("assessment");
        application2.tagAndCategoryExists([assessmentTag]);
        application2.tagAndCategoryDontExist([archetypeTag, ["Language", "Java"]]);
        application2.closeApplicationDetails();

        // Verify archetype tag and assessment tag are discarded after archetype disossociation
        archetype.delete();
        application2.applicationDetailsTab("Tags");
        application.tagAndCategoryDontExist([assessmentTag, archetypeTag]);

        application2.closeApplicationDetails();
        application.delete();
        application2.delete();
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholderList);
        deleteByList(applicationList);
        deleteByList(archetypeList);
        AssessmentQuestionnaire.deleteAllQuestionnaires();
    });
});
