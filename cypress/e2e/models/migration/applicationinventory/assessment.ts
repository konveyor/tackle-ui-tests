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
import * as data from "../../../../utils/data_utils";
import {
    click,
    clickByText,
    clickJs,
    selectFormItems,
    selectItemsPerPage,
    sidedrawerTab,
} from "../../../../utils/utils";
import {
    button,
    legacyPathfinder,
    riskDonutChart,
    SEC,
    tdTag,
    text,
    trTag,
} from "../../../types/constants";
import { notYetReviewed, reviewItems } from "../../../views/archetype.view";
import {
    assessmentBlock,
    assessmentColumnSelector,
    donutChart,
    donutChartImage,
    questionBlock,
    radioInput,
    stack,
    stakeholdersAndGroupsSelect,
    victoryContainer,
} from "../../../views/assessment.view";
import * as commonView from "../../../views/common.view";
import { plainButton, splitItem, tableRowActions } from "../../../views/common.view";
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
    public static selectStakeholdersAndGroups(
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[]
    ): void {
        stakeholders?.forEach(function (stakeholder) {
            selectFormItems(stakeholdersAndGroupsSelect, stakeholder.name);
        });
        stakeholderGroups?.forEach(function (stakeholderGroup) {
            selectFormItems(stakeholdersAndGroupsSelect, stakeholderGroup.name);
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
        click(proposedActionSelect, false);
        clickByText(button, action);
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
        // Allowed values for risk: low, medium, high, unknown
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
                                .find(splitItem)
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
                        } else if (risk === "high") {
                            optionToSelect = 1;
                            this.clickRadioOption($question, optionToSelect);
                        } else {
                            // if risk = 'unknown'
                            optionToSelect = 0;
                            this.clickRadioOption($question, optionToSelect);
                        }
                    });

                    if (saveAndReview && i == lastStep) {
                        clickJs(commonView.saveAndReviewButton);
                    } else {
                        // title on questionnaire changes on each page
                        // This avoids the use of arbitrary `cy.wait()` calls
                        cy.get("h1")
                            .invoke("text")
                            .then((titleBefore) => {
                                clickJs(commonView.nextButton);
                                cy.get("h1", { timeout: 10000 }).should(($h1) => {
                                    const titleAfter = $h1.text().trim();
                                    expect(titleAfter).not.to.eq(titleBefore);
                                });
                            });
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
        cy.contains(questionnaireName, { timeout: 70 * SEC })
            .siblings("td")
            .contains("button", "Take", { timeout: 70 * SEC })
            .click();
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
        if (stakeholders || stakeholderGroups)
            this.selectStakeholdersAndGroups(stakeholders, stakeholderGroups);
        clickJs(commonView.nextButton);
        this.selectAnswers(risk, saveAndReview);
    }

    public static perform_review(risk): void {
        this.selectMigrationAction(risk);
        this.selectEffortEstimate(risk);
        this.fillCriticality(risk);
        this.fillPriority(risk);
        clickByText(button, "Submit review");
    }

    public static validateReviewFields(
        name: string,
        entityName: string,
        archetypeName?: string
    ): void {
        sidedrawerTab(name, "Review");
        if (archetypeName) name = archetypeName;
        let list = [
            "Proposed action",
            "Effort estimate",
            "Business criticality",
            "Work priority",
            "Comments",
        ];
        let actionList = [
            `${entityName} - ${name}-Rehost`,
            `${entityName} - ${name}-Replatform`,
            `${entityName} - ${name}-Refactor`,
            `${entityName} - ${name}-Retain`,
            `${entityName} - ${name}-Repurchase`,
            `${entityName} - ${name}-Retire`,
        ];
        let effortEstimateList = [
            `${entityName} - ${name}-Small`,
            `${entityName} - ${name}-Medium`,
            `${entityName} - ${name}-Large`,
            `${entityName} - ${name}-Extra large`,
        ];
        let criticalityList = [
            `${entityName} - ${name}-1`,
            `${entityName} - ${name}-2`,
            `${entityName} - ${name}-3`,
            `${entityName} - ${name}-4`,
            `${entityName} - ${name}-5`,
            `${entityName} - ${name}-6`,
            `${entityName} - ${name}-7`,
            `${entityName} - ${name}-8`,
            `${entityName} - ${name}-9`,
            `${entityName} - ${name}-10`,
        ];

        for (let i in list) {
            cy.get("dt", { timeout: 3 * SEC })
                .contains(list[i])
                .closest("div")
                .within(() => {
                    if (archetypeName) {
                        cy.get("span.pf-v5-c-label__text").each((item) => {
                            if (Cypress.$(item).text().includes(name)) {
                                if (list[i] == "Proposed action")
                                    expect(Cypress.$(item).text()).to.be.oneOf(actionList);
                                if (list[i] == "Effort estimate")
                                    expect(Cypress.$(item).text()).to.be.oneOf(effortEstimateList);
                                if (list[i] == "Business criticality" || list[i] == "Work priority")
                                    expect(Cypress.$(item).text()).to.be.oneOf(criticalityList);
                                if (list[i] == "Comments")
                                    expect(Cypress.$(item).text()).not.equal("Not yet reviewed");
                            }
                        });
                    } else {
                        cy.get("dd").then(($value) => {
                            let text = $value.text();
                            if (list[i] == "Proposed action") expect(text).to.be.oneOf(actionList);
                            if (list[i] == "Effort estimate")
                                expect(text).to.be.oneOf(effortEstimateList);
                            if (list[i] == "Business criticality" || list[i] == "Work priority")
                                expect(text).to.be.oneOf(criticalityList);
                            if (list[i] == "Comments") expect(text).not.equal("Not yet reviewed");
                        });
                    }
                });
        }
        click(commonView.sideDrawer.closeDrawer);
    }

    public static validateNotReviewed(name: string) {
        cy.wait(SEC * 10);
        sidedrawerTab(name, "Review");
        reviewItems.forEach((listItem) => {
            cy.get(`[cy-data="${listItem}"]`).then(($element) => {
                const foundText = $element.text();
                expect(foundText).to.contains(notYetReviewed);
            });
        });
        click(commonView.sideDrawer.closeDrawer);
    }

    public static verifyStatus(name, column, status): void {
        let columnSelector: string;
        if (column === "assessment") columnSelector = assessmentColumnSelector;
        else columnSelector = reviewColumnSelector;
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(name)
            .closest(trTag)
            .within(() => {
                cy.get(columnSelector).contains(status, { timeout: 30 * SEC });
            });
    }

    public static validateAssessmentField(name: string, page: string, risk: string): void {
        sidedrawerTab(name, "Details");
        cy.get(commonView.sideDrawer.risk).contains(`${page} risk`);
        cy.get(commonView.sideDrawer.labelContent).contains(risk);
        click(commonView.sideDrawer.closeDrawer);
    }

    public static deleteAssessments(): void {
        cy.get(tableRowActions).each(($el) => {
            cy.wrap($el).find(plainButton).click();
        });
    }

    public static verifyButtonEnabled(button: string): void {
        cy.contains("button", button, { timeout: 30 * SEC }).should(
            "not.have.attr",
            "aria-disabled",
            "true"
        );
    }
    public static validateReviewDonutChart(): void {
        cy.get(donutChart).should("be.visible");
        cy.get(donutChartImage).should("have.attr", "role", "img").and("be.visible");
        cy.get(victoryContainer).should("contain", riskDonutChart);

        // Validate number of sections in chart match the number of legend text items
        cy.get(donutChart).within(() => {
            cy.get("g")
                .first()
                .find('path[role="presentation"][d]')
                .its("length")
                .then((numberOfPathsInFirstG) => {
                    cy.get(text).should("have.length", numberOfPathsInFirstG);
                });
        });
    }
}
