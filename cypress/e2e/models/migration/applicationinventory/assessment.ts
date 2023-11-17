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
import { Application } from "./application";
import { tdTag, trTag, button, review, SEC } from "../../../types/constants";
import {
    actionButton,
    selectBox,
    closeForm,
    copy,
    kebabMenu,
    northdependenciesDropdownBtn,
    southdependenciesDropdownBtn,
    copyAssessmentModal,
} from "../../../views/applicationinventory.view";
import * as commonView from "../../../views/common.view";
import {
    clickByText,
    click,
    selectItemsPerPage,
    cancelForm,
    selectFormItems,
    performRowActionByIcon,
    checkSuccessAlert,
    clickJs,
    clickItemInKebabMenu,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import {
    assessmentColumnSelector,
    questionBlock,
    radioInput,
    stakeholdergroupsSelect,
    stakeholderSelect,
    continueButton,
    stack,
} from "../../../views/assessment.view";
import {
    criticalityInput,
    effortEstimateSelect,
    priorityInput,
    proposedActionSelect,
    reviewColumnSelector,
} from "../../../views/review.view";
import { applicationData } from "../../../types/types";

export class Assessment extends Application {
    constructor(appData: applicationData) {
        super(appData);
    }

    protected selectStakeholders(stakeholders: Array<string>): void {
        stakeholders.forEach(function (stakeholder) {
            selectFormItems(stakeholderSelect, stakeholder);
        });
    }

    protected selectStakeholderGroups(stakeholderGroups: Array<string>): void {
        stakeholderGroups.forEach(function (stakeholderGroup) {
            selectFormItems(stakeholdergroupsSelect, stakeholderGroup);
        });
    }

    protected selectMigrationAction(risk: string): void {
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

    protected selectEffortEstimate(risk: string): void {
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

    protected getNumByRisk(risk: string): number {
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

    protected fillCriticality(risk: string): void {
        const criticality = this.getNumByRisk(risk);
        cy.get(criticalityInput).type(`{selectAll}${criticality}`).blur();
        cy.wait(SEC);
    }

    protected fillPriority(risk: string): void {
        const priority = this.getNumByRisk(risk);
        cy.get(priorityInput).type(`{selectAll}${priority}`).blur();
        cy.wait(SEC);
    }

    protected clickRadioOption(questionSelector, optionToSelect) {
        cy.wrap(questionSelector)
            .find(stack)
            .children("div")
            .eq(optionToSelect)
            .find(radioInput)
            .check();
    }

    protected selectAnswers(risk: string): void {
        for (let i = 0; i < 5; i++) {
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
            if (i === 4) {
                clickJs(commonView.nextButton);
            } else {
                clickJs(commonView.nextButton);
            }
        }
    }

    edit(
        updatedValues: {
            name?: string;
            description?: string;
            business?: string;
            tags?: Array<string>;
            comment?: string;
        },
        cancel = false
    ): void {
        Application.open();
        super.edit(updatedValues);
    }

    retake_assessment(
        risk,
        stakeholders?: Array<string>,
        stakeholderGroups?: Array<string>,
        applicationOpen = false
    ): void {
        Application.open();
        this.selectApplication();
        clickItemInKebabMenu(this.name, "Assess");
        cy.wait(SEC);
        clickByText(button, "Retake");
        if (stakeholders == undefined && stakeholderGroups == undefined) {
            expect(
                false,
                "At least one arg out of stakeholder or stakeholder groups must be provided !"
            ).to.equal(true);
        } else if (stakeholders && stakeholderGroups == undefined)
            this.perform_assessment(risk, stakeholders, null, (applicationOpen = false));
        else if (stakeholders == undefined && stakeholderGroups)
            this.perform_assessment(risk, stakeholderGroups, null, (applicationOpen = false));
        else if (stakeholders && stakeholderGroups)
            this.perform_assessment(
                risk,
                stakeholderGroups,
                stakeholderGroups,
                (applicationOpen = false)
            );
    }

    take_questionnaire(): void {
        clickByText(button, "Take");
    }

    perform_assessment(
        risk,
        stakeholders?: Array<string>,
        stakeholderGroups?: Array<string>,
        applicationOpen = true
    ): void {
        if (stakeholders == undefined && stakeholderGroups == undefined) {
            expect(
                false,
                "At least one arg out of stakeholder or stakeholder groups must be provided !"
            ).to.equal(true);
        } else {
            if (applicationOpen) {
                Application.open();
                this.selectApplication();
                clickItemInKebabMenu(this.name, "Assess");
                cy.wait(SEC);
                this.take_questionnaire();
                cy.wait(SEC);
            }
            if (stakeholders) this.selectStakeholders(stakeholders);
            if (stakeholderGroups) this.selectStakeholderGroups(stakeholderGroups);
            clickJs(commonView.nextButton);
            cy.wait(SEC);
            this.selectAnswers(risk);
        }
    }

    perform_review(risk): void {
        Application.open();
        selectItemsPerPage(100);
        this.selectApplication();
        clickItemInKebabMenu(this.name, "Review");
        cy.wait(8 * SEC);
        this.selectMigrationAction(risk);
        this.selectEffortEstimate(risk);
        this.fillCriticality(risk);
        this.fillPriority(risk);
        clickByText(button, "Submit review");
        cy.wait(2 * SEC);
    }

    // Method to verify the status of Assessment and Review
    verifyStatus(column, status): void {
        Application.open();
        let columnSelector: string;

        if (column === "assessment") columnSelector = assessmentColumnSelector;
        else columnSelector = reviewColumnSelector;

        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(this.name)
            .parent(trTag)
            .within(() => {
                cy.get(columnSelector).contains(status, { timeout: 15000 });
            });
    }

    // Opens the manage dependencies dialog from application inventory page
    openManageDependencies(): void {
        Application.open();
        selectItemsPerPage(100);
        performRowActionByIcon(this.name, kebabMenu);
        clickByText(button, "Manage dependencies");
    }

    // Selects the application as dependency from dropdown. Arg dropdownNum value 0 selects northbound, whereas value 1 selects southbound
    selectNorthDependency(appNameList: Array<string>): void {
        appNameList.forEach(function (app) {
            cy.get(northdependenciesDropdownBtn).click();
            cy.contains("button", app).click();
        });
    }

    // Selects the application as dependency from dropdown. Arg dropdownNum value 0 selects northbound, whereas value 1 selects southbound
    selectDependency(dropdownLocator: string, appNameList: Array<string>): void {
        appNameList.forEach(function (app) {
            cy.get(dropdownLocator).click();
            cy.contains("button", app).click();
        });
    }

    // Add north or south bound dependency for an application
    addDependencies(northbound?: Array<string>, southbound?: Array<string>): void {
        if (northbound || southbound) {
            this.openManageDependencies();
            if (northbound.length > 0) {
                this.selectDependency(northdependenciesDropdownBtn, northbound);
                cy.wait(SEC);
            }
            if (southbound.length > 0) {
                this.selectDependency(southdependenciesDropdownBtn, southbound);
                cy.wait(SEC);
            }
            cy.wait(2 * SEC);
            click(closeForm);
        }
    }

    removeDep(dependency, dependencyType) {
        cy.get("div")
            .contains(`Add ${dependencyType} dependencies`)
            .parent("div")
            .siblings()
            .find("span")
            .should("contain.text", dependency)
            .parent("div")
            .find("button")
            .trigger("click");
        if (dependencyType === "northbound") cy.get(northdependenciesDropdownBtn).click();
        else cy.get(southdependenciesDropdownBtn).click();
    }

    // Remove north or south bound dependency for an application
    removeDependencies(northbound?: Array<string>, southbound?: Array<string>): void {
        if (northbound || southbound) {
            this.openManageDependencies();
            if (northbound.length > 0) {
                this.removeDep(northbound[0], "northbound");
                cy.wait(SEC);
            }
            if (southbound.length > 0) {
                this.removeDep(southbound[0], "southbound");
                cy.wait(SEC);
            }
            cy.wait(2 * SEC);
            click(closeForm);
        }
    }
    // Verifies if the north or south bound dependencies exist for an application
    verifyDependencies(northboundApps?: Array<string>, southboundApps?: Array<string>): void {
        if (northboundApps || southboundApps) {
            this.openManageDependencies();
            cy.wait(2 * SEC);
            if (northboundApps && northboundApps.length > 0) {
                northboundApps.forEach((app) => {
                    this.dependencyExists("northbound", app);
                });
            }
            if (southboundApps && southboundApps.length > 0) {
                southboundApps.forEach((app) => {
                    this.dependencyExists("southbound", app);
                });
            }
            click(closeForm);
        }
    }

    // Checks if app name is displayed in the dropdown under respective dependency
    protected dependencyExists(dependencyType: string, appName: string): void {
        cy.get("div")
            .contains(`Add ${dependencyType} dependencies`)
            .parent("div")
            .siblings()
            .find("span")
            .should("contain.text", appName);
    }

    verifyCopyAssessmentDisabled(): void {
        Application.open();
        selectItemsPerPage(100);
        cy.wait(2 * SEC);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                cy.get("ul > li").find(button).should("not.contain", "Copy assessment");
            });
    }

    copy_assessment(applicationList: Array<Application>, cancel = false): void {
        this.openCopyAssessmentModel();
        this.selectApps(applicationList);
        if (cancel) {
            cancelForm();
        } else {
            click(copy);
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! Assessment copied to selected applications`
            );
        }
    }

    copy_assessment_review(applicationList: Array<Application>, cancel = false): void {
        this.openCopyAssessmentModel(true);
        this.selectApps(applicationList);

        if (cancel) {
            cancelForm();
        } else {
            click(copy);
            cy.wait(2 * SEC);
        }
    }

    selectKebabMenuItem(selection: string): void {
        Application.open();
        selectItemsPerPage(100);
        this.selectApplication();
        clickItemInKebabMenu(this.name, selection);
        cy.get(continueButton).click();
    }

    selectApps(applicationList: Array<Application>): void {
        cy.wait(4 * SEC);
        for (let i = 0; i < applicationList.length; i++) {
            if (applicationList[i].name != this.name) {
                cy.get(".pf-m-compact> tbody > tr > td")
                    .contains(applicationList[i].name)
                    .parent(trTag)
                    .within(() => {
                        click(selectBox);
                        cy.wait(2 * SEC);
                    });
            }
        }
    }

    openCopyAssessmentModel(review = false, items = 100): void {
        let action = "Copy assessment";
        if (review) {
            action += " and review";
        }
        Application.open();
        selectItemsPerPage(items);
        cy.wait(2 * SEC);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                clickByText(button, action);
            });
        cy.get(copyAssessmentModal).within(() => {
            selectItemsPerPage(items);
        });
    }

    selectItemsPerPage(items: number): void {
        cy.get(copyAssessmentModal).within(() => {
            selectItemsPerPage(items);
        });
    }

    // Method to verify review button is disabled
    verifyReviewButtonDisabled(): void {
        Application.open();
        selectItemsPerPage(100);
        cy.wait(2 * SEC);
        this.selectApplication();
        cy.get(button).contains(review).should("be.disabled");
    }
}
