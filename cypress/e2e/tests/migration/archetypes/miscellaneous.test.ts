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
    click,
    clickJs,
    exists,
    login,
    deleteByList,
    clickByText,
    createMultipleStakeholders,
    checkSuccessAlert,
    createMultipleApplications,
    selectRow,
} from "../../../../utils/utils";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import {
    nextButton,
    radioButton,
    radioButtonLabel,
    splitItem,
    successAlertMessage,
} from "../../../views/common.view";
import {
    legacyPathfinder,
    SEC,
    button,
    cloudReadinessQuestionnaire,
    cloudReadinessFilePath,
} from "../../../types/constants";
import { Application } from "../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Assessment } from "../../../models/migration/applicationinventory/assessment";
import * as data from "../../../../utils/data_utils";
import {
    ArchivedQuestionnaires,
    ArchivedQuestionnairesTableDataCell,
} from "../../../views/assessmentquestionnaire.view";
import { questionBlock } from "../../../views/assessment.view";

let stakeholderList: Stakeholders[];
let archetype: Archetype;
let applications: Application[];

describe(["@tier3"], "Miscellaneous Archetype tests", () => {
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
        archetype.perform_assessment("high", stakeholderList, null, cloudReadinessQuestionnaire);
        archetype.validateAssessmentField("High");
        archetype.perform_review("high");
    });

    it("Verify associated application count and link", function () {
        // Automates Polarion MTA-529
        Archetype.verifyColumnValue(
            archetype.name,
            "Applications",
            "No applications currently match the criteria tags."
        );
        applications = createMultipleApplications(2, ["Language / Java", "Runtime / Quarkus"]);
        Archetype.verifyColumnValue(archetype.name, "Applications", "2 applications");
        selectRow(archetype.name);
        cy.get("span.pf-v5-c-description-list__text")
            .contains("Applications")
            .closest("div")
            .within(() => {
                click("a");
            });
        exists(applications[0].name);
        exists(applications[1].name);
        deleteByList(applications);
    });

    it("Retake questionnaire for Archetype", function () {
        //Automates Polarion MTA-394
        Archetype.open(true);
        archetype.clickAssessButton();
        cy.wait(SEC);
        clickByText(button, "Retake");
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
        clickByText(button, "Cancel");
        clickByText(button, "Continue");
    });

    it("View archived questionnaire for archetype", function () {
        // Polarion TC MTA-391
        AssessmentQuestionnaire.disable(cloudReadinessQuestionnaire);
        archetype.clickAssessButton();
        cy.contains("table", ArchivedQuestionnaires)
            .find(ArchivedQuestionnairesTableDataCell)
            .should("have.text", cloudReadinessQuestionnaire);

        AssessmentQuestionnaire.enable(legacyPathfinder);
        archetype.clickAssessButton();
        cy.contains("table", ArchivedQuestionnaires)
            .find(ArchivedQuestionnairesTableDataCell)
            .last()
            .should("not.have.text", legacyPathfinder);
        cy.contains("table", "Required questionnaires")
            .find('td[data-label="Required questionnaires"]')
            .last()
            .should("have.text", legacyPathfinder);

        AssessmentQuestionnaire.disable(legacyPathfinder);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
    });

    it("Discard archetype assessment from kebab menu & Assessment Actions page", function () {
        //Automates Polarion MTA-427 Discard assessment through kebab menu
        Archetype.open(true);
        archetype.discard("Discard assessment(s)");
        checkSuccessAlert(
            successAlertMessage,
            `Success! Assessment discarded for ${archetype.name}.`,
            true
        );
        archetype.verifyStatus("assessment", "Not started");

        // Automates Polarion MTA-439 Delete assessment through Assessment Actions page
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
        archetype.perform_assessment("high", stakeholderList, null, cloudReadinessQuestionnaire);
        Archetype.open(true);
        archetype.deleteAssessments();
        archetype.verifyButtonEnabled("Take");
        checkSuccessAlert(
            successAlertMessage,
            `Success! Assessment discarded for ${archetype.name}.`,
            true
        );
        archetype.verifyStatus("assessment", "Not started");
    });

    it("Discard archetype review", function () {
        // Automates Polarion MTA-428
        Archetype.open(true);
        archetype.discard("Discard review");
        checkSuccessAlert(
            successAlertMessage,
            `Success! Review discarded for ${archetype.name}.`,
            true
        );
        cy.wait(2 * SEC);
        archetype.verifyStatus("review", "Not started");
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholderList);
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        archetype.delete();
    });
});
