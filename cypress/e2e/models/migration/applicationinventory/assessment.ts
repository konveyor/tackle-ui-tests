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
import { tdTag, trTag, button, SEC, legacyPathfinder } from "../../../types/constants";
import * as commonView from "../../../views/common.view";
import { clickByText, selectItemsPerPage, selectFormItems, clickJs } from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import {
    assessmentColumnSelector,
    questionBlock,
    radioInput,
    stakeholdergroupsSelect,
    stakeholderSelect,
    stack,
    assessmentBlock,
} from "../../../views/assessment.view";
import {
    criticalityInput,
    effortEstimateSelect,
    priorityInput,
    proposedActionSelect,
    reviewColumnSelector,
} from "../../../views/review.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";

export class Assessment {
    public static selectStakeholders(stakeholders: Stakeholders[]): void {
        stakeholders.forEach(function (stakeholder) {
            selectFormItems(stakeholderSelect, stakeholder.name);
        });
    }

    public static selectStakeholderGroups(stakeholderGroups: Stakeholdergroups[]): void {
        stakeholderGroups.forEach(function (stakeholderGroup) {
            selectFormItems(stakeholdergroupsSelect, stakeholderGroup.name);
        });
    }

    public static selectMigrationAction(risk: string): void {
        let action: string;
        if (risk === "low") {
            const migrationActions = ["Replatform", "Refactor", "Rehost", "Retain"];
            action = migrationActions[Math.floor(Math.random() * migrationActions.length)];
        } else if (risk === "medium") {
            const migrationActions = ["Replatform", "Repurchase", "Refactor"];
            action = migrationActions[Math.floor(Math.random() * migrationActions.length)];
        } else {
            const migrationActions = ["Repurchase", "Retire"];
            action = migrationActions[Math.floor(Math.random() * migrationActions.length)];
        }
        cy.get(proposedActionSelect).click();
        cy.contains(button, action).click();
    }

    public static selectEffortEstimate(risk: string): void {
        let effort: string;
        if (risk === "low") {
            effort = "Small";
        } else if (risk === "medium") {
            effort = "Medium";
        } else {
            const effortEstimates = ["Large", "Extra large"];
            effort = effortEstimates[Math.floor(Math.random() * effortEstimates.length)];
        }
        cy.get(effortEstimateSelect).click();
        cy.contains(button, effort).click();
    }

    public static getNumByRisk(risk: string): number {
        let num: number;
        if (risk === "low") {
            num = data.getRandomNumber(1, 4);
        } else if (risk === "medium") {
            num = data.getRandomNumber(5, 7);
        } else {
            num = data.getRandomNumber(8, 10);
        }
        return num;
    }

    public static fillCriticality(risk: string): void {
        const criticality = this.getNumByRisk(risk);
        cy.get(criticalityInput).type(`{selectAll}${criticality}`).blur();
        cy.wait(SEC);
    }

    public static fillPriority(risk: string): void {
        const priority = this.getNumByRisk(risk);
        cy.get(priorityInput).type(`{selectAll}${priority}`).blur();
        cy.wait(SEC);
    }

    public static clickRadioOption(questionSelector, optionToSelect) {
        cy.wrap(questionSelector)
            .find(stack)
            .children("div")
            .eq(optionToSelect)
            .find(radioInput)
            .check();
    }

    public static selectAnswers(risk: string, saveAndReview = false): void {
        cy.get(assessmentBlock)
            .its("length")
            .then((count) => {
                let lastStep = count - 2;

                for (let i = 0; i <= lastStep; i++) {
                    cy.get(questionBlock).each(($question) => {
                        let totalOptions = $question.find(stack).children("div").length;
                        let optionToSelect: number;
                        if (risk === "low") {
                            optionToSelect = totalOptions - 1;
                            this.clickRadioOption($question, optionToSelect);
                        } else if (risk === "medium") {
                            cy.wrap($question)
                                .children()
                                .find("div.pf-v5-l-split__item")
                                .then(($questionLine) => {
                                    /* These 3 questions generate high risk with mean options,
                                    hence to keep risk to medium, select last options for these set of specific questions */
                                    if (
                                        $questionLine.text() ===
                                            "Does the application have legal and/or licensing requirements?" ||
                                        $questionLine.text() ===
                                            "Does the application require specific hardware?" ||
                                        $questionLine.text() ===
                                            "How is the application clustering managed?"
                                    ) {
                                        optionToSelect = totalOptions - 1;
                                    } else {
                                        optionToSelect = Math.floor(totalOptions / 2);
                                    }
                                    this.clickRadioOption($question, optionToSelect);
                                });
                        } else {
                            optionToSelect = 1;
                            this.clickRadioOption($question, optionToSelect);
                        }
                    });

                    if (saveAndReview && i == lastStep) {
                        clickJs(commonView.saveAndReviewButton);
                    } else {
                        clickJs(commonView.nextButton);
                    }
                }
            });
    }

    public static retake_questionnaire(
        risk,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[]
    ): void {
        clickByText(button, "Retake");
        this.fill_assessment_form(risk, stakeholders, stakeholderGroups);
    }

    public static take_questionnaire(questionnaireName = legacyPathfinder): void {
        cy.contains(questionnaireName).siblings("td").contains("button", "Take").click();
    }

    public static perform_assessment(
        risk,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[],
        questionnaireName = legacyPathfinder,
        saveAndReview = false
    ): void {
        this.take_questionnaire(questionnaireName);
        cy.wait(SEC);
        this.fill_assessment_form(risk, stakeholders, stakeholderGroups, saveAndReview);
    }

    public static fill_assessment_form(
        risk,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[],
        saveAndReview = false
    ): void {
        if (stakeholders) this.selectStakeholders(stakeholders);
        if (stakeholderGroups) this.selectStakeholderGroups(stakeholderGroups);
        clickJs(commonView.nextButton);
        cy.wait(SEC);
        this.selectAnswers(risk, saveAndReview);
    }

    public static perform_review(risk): void {
        this.selectMigrationAction(risk);
        this.selectEffortEstimate(risk);
        this.fillCriticality(risk);
        this.fillPriority(risk);
        clickByText(button, "Submit review");
        cy.wait(2 * SEC);
    }

    public static verifyStatus(name, column, status): void {
        let columnSelector: string;
        if (column === "assessment") columnSelector = assessmentColumnSelector;
        else columnSelector = reviewColumnSelector;
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(name)
            .parent(trTag)
            .within(() => {
                cy.get(columnSelector).contains(status, { timeout: 30 * SEC });
            });
    }
}
