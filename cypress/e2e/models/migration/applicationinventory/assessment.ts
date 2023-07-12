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
import { Application } from "../applicationinventory/application";
import {
    applicationInventory,
    tdTag,
    trTag,
    button,
    next,
    review,
    save,
    assessment,
    SEC,
    assessAppButton,
    migration,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    actionButton,
    selectBox,
    closeForm,
    copy,
    kebabMenu,
    northdependenciesDropdownBtn,
    southdependenciesDropdownBtn,
    copyAssessmentPagination,
} from "../../../views/applicationinventory.view";
import * as commonView from "../../../views/common.view";
import {
    clickByText,
    click,
    selectItemsPerPage,
    cancelForm,
    selectFormItems,
    selectUserPerspective,
    performRowActionByIcon,
    checkSuccessAlert,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import {
    assessmentColumnSelector,
    questionBlock,
    radioInput,
    stakeholdergroupsSelect,
    stakeholderSelect,
    continueButton,
} from "../../../views/assessment.view";
import {
    criticalityInput,
    effortEstimateSelect,
    priorityInput,
    proposedActionSelect,
    reviewColumnSelector,
    selectInput,
} from "../../../views/review.view";
import { applicationData } from "../../../types/types";

export class Assessment extends Application {
    // name: string;
    // business: string;

    constructor(appData: applicationData) {
        super(appData);
    }

    //Navigate to the Application inventory->Assessment tab
    public static open(forceReload = false): void {
        if (forceReload) {
            cy.visit(Cypress.env("tackleUrl"));
        }
        selectUserPerspective(migration);
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, assessment);
    }

    protected selectStakeholders(stakeholders: Array<string>): void {
        stakeholders.forEach(function (stakeholder) {
            selectFormItems(stakeholderSelect, stakeholder);
        });
    }

    protected selectStakeholdergroups(stakeholdergroups: Array<string>): void {
        stakeholdergroups.forEach(function (stakeholdergroup) {
            selectFormItems(stakeholdergroupsSelect, stakeholdergroup);
        });
    }

    protected selectMigrationAction(risk: string): void {
        var action: string;
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
        var effort: string;
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
        var num: number;
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
            .find("div.pf-l-stack")
            .children("div")
            .eq(optionToSelect)
            .find(radioInput)
            .check();
    }

    protected selectAnswers(risk: string): void {
        for (let i = 0; i < 5; i++) {
            cy.get(questionBlock).each(($question) => {
                var totalOptions = $question.find("div.pf-l-stack").children("div").length;
                var optionToSelect: number;
                if (risk === "low") {
                    optionToSelect = totalOptions - 1;
                    this.clickRadioOption($question, optionToSelect);
                } else if (risk === "medium") {
                    cy.wrap($question)
                        .children()
                        .find("div.pf-l-split__item")
                        .then(($questionLine) => {
                            /* These 3 questions generate high risk with mean options, 
                            hence to keep risk to medium, select last options for these set of specifc questions */
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
                clickByText(button, save);
            } else {
                clickByText(button, next);
            }
        }
    }

    create(): void {
        Assessment.open();
        super.create();
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
        Assessment.open();
        super.edit(updatedValues);
    }

    delete(cancel = false): void {
        Assessment.open();
        super.delete();
    }

    click_assess_button(): void {
        click(assessAppButton);
    }

    perform_assessment(
        risk,
        stakeholders?: Array<string>,
        stakeholdergroups?: Array<string>
    ): void {
        if (stakeholders == undefined && stakeholdergroups == undefined) {
            expect(
                false,
                "Atleast one arg out of stakeholder or stakeholdergroups must be provided !"
            ).to.equal(true);
        } else {
            Assessment.open();
            selectItemsPerPage(100);
            this.selectApplication();
            this.click_assess_button();
            cy.wait(6000);
            if (stakeholders) this.selectStakeholders(stakeholders);
            if (stakeholdergroups) this.selectStakeholdergroups(stakeholdergroups);
            clickByText(button, next);
            cy.wait(1000);
            this.selectAnswers(risk);
        }
    }

    perform_review(risk): void {
        Assessment.open();
        selectItemsPerPage(100);
        this.selectApplication();
        clickByText(button, review);
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
        let columnSelector: string;

        if (column === "assessment") columnSelector = assessmentColumnSelector;
        else columnSelector = reviewColumnSelector;

        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                cy.get(columnSelector).contains(status, { timeout: 15000 });
            });
    }

    // Opens the manage dependencies dialog from application inventory page
    openManageDependencies(): void {
        Assessment.open();
        selectItemsPerPage(100);
        performRowActionByIcon(this.name, kebabMenu);
        clickByText(button, "Manage dependencies");
    }

    // Selects the application as dependency from dropdown. Arg dropdownNum value 0 selects northbound, whereas value 1 selects southbound
    selectnorthDependency(appNameList: Array<string>): void {
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
            // cy.wait(1000);
            if (northbound.length > 0) {
                this.selectDependency(northdependenciesDropdownBtn, northbound);
                cy.wait(1000);
            }
            if (southbound.length > 0) {
                this.selectDependency(southdependenciesDropdownBtn, southbound);
                cy.wait(1000);
            }
            cy.wait(2000);
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
                cy.wait(1000);
            }
            if (southbound.length > 0) {
                this.removeDep(southbound[0], "southbound");
                cy.wait(1000);
            }
            cy.wait(2000);
            click(closeForm);
        }
    }
    // Verifies if the north or south bound dependencies exist for an application
    verifyDependencies(northboundApps?: Array<string>, southboundApps?: Array<string>): void {
        if (northboundApps || southboundApps) {
            this.openManageDependencies();
            cy.wait(2000);
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
        Assessment.open();
        selectItemsPerPage(100);
        cy.wait(2000);
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
        this.openCopyAssessmentReviewModel();
        this.selectApps(applicationList);

        if (cancel) {
            cancelForm();
        } else {
            click(copy);
            cy.wait(2000);
        }
    }

    discard_assessment(): void {
        Assessment.open();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                clickByText(button, "Discard assessment");
            });
        cy.get(continueButton).click();
        checkSuccessAlert(
            commonView.successAlertMessage,
            `Success! Assessment discarded for ${this.name}.`
        );
    }

    selectApps(applicationList: Array<Application>): void {
        cy.wait(4000);
        for (let i = 0; i < applicationList.length; i++) {
            if (applicationList[i].name != this.name) {
                cy.get(".pf-m-compact> tbody > tr > td")
                    .contains(applicationList[i].name)
                    .parent(trTag)
                    .within(() => {
                        click(selectBox);
                        cy.wait(2000);
                    });
            }
        }
    }

    openCopyAssessmentModel(): void {
        Assessment.open();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                clickByText(button, "Copy assessment");
            });
    }

    openCopyAssessmentReviewModel(): void {
        Assessment.open();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                clickByText(button, "Copy assessment and review");
            });
    }

    selectItemsPerPage(items: number): void {
        cy.wait(2000);
        cy.get(copyAssessmentPagination)
            .find(commonView.itemsPerPageMenu)
            .find(commonView.itemsPerPageToggleButton)
            .then(($toggleBtn) => {
                if (!$toggleBtn.eq(0).is(":disabled")) {
                    $toggleBtn.eq(0).trigger("click");
                    cy.get(commonView.itemsPerPageMenuOptions);
                    cy.get(`li > button[data-action="per-page-${items}"]`).click({ force: true });
                    cy.wait(2000);
                }
            });
    }

    // Method to verify review button is disabled
    verifyReviewButtonDisabled(): void {
        Assessment.open();
        selectItemsPerPage(100);
        cy.wait(2000);
        this.selectApplication();
        cy.get(button).contains(review).should("be.disabled");
    }
}
