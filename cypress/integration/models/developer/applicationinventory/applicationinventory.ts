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
import {
    applicationInventory,
    tdTag,
    trTag,
    button,
    createNewButton,
    deleteAction,
    assess,
    next,
    review,
    save,
    name,
    tagCount,
    assessment,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    applicationNameInput,
    applicationDescriptionInput,
    applicationBusinessServiceSelect,
    applicationTagsSelect,
    applicationCommentInput,
    editButton,
    actionButton,
    selectBox,
    tags,
    dependenciesDropdownBtn,
    closeForm,
    copy,
    reactSelectorAssessButton,
} from "../../../views/applicationinventory.view";
import * as commonView from "../../../views/common.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    selectFormItems,
    checkSuccessAlert,
    performRowAction,
    selectUserPerspective,
} from "../../../../utils/utils";
import * as data from "../../../../utils/data_utils";
import {
    assessmentColumnSelector,
    questionBlock,
    radioInput,
    stakeholdergroupsSelect,
    stakeholderSelect,
} from "../../../views/assessment.view";
import {
    criticalityInput,
    priorityInput,
    reviewColumnSelector,
    selectInput,
} from "../../../views/review.view";

export class ApplicationInventory {
    name: string;
    business: string;
    description: string;
    tags: Array<string>;
    comment: string;

    constructor(
        name: string,
        business: string,
        description?: string,
        comment?: string,
        tags?: Array<string>
    ) {
        this.name = name;
        this.business = business;
        if (description) this.description = description;
        if (comment) this.comment = comment;
        if (tags) this.tags = tags;
    }
    public static clickApplicationInventory(): void {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, assessment);
    }

    protected fillName(name: string): void {
        inputText(applicationNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(applicationDescriptionInput, description);
    }

    protected fillComment(comment: string): void {
        inputText(applicationCommentInput, comment);
    }
    protected selectBusinessService(service: string): void {
        selectFormItems(applicationBusinessServiceSelect, service);
    }

    protected selectTags(tags: Array<string>): void {
        tags.forEach(function (tag) {
            selectFormItems(applicationTagsSelect, tag);
        });
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
        cy.get(selectInput).eq(0).click();
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
        cy.get(selectInput).eq(1).click();
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
        var criticality = this.getNumByRisk(risk);
        inputText(criticalityInput, criticality);
    }

    protected fillPriority(risk: string): void {
        var priority = this.getNumByRisk(risk);
        inputText(priorityInput, priority);
    }

    selectApplication(): void {
        cy.wait(4000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(selectBox);
                cy.wait(2000);
            });
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

    protected verifyCompleteStatus(columnSelector): void {
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                cy.get(columnSelector).find("div").should("contain", "Completed");
            });
    }

    create(cancel = false): void {
        ApplicationInventory.clickApplicationInventory();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.selectBusinessService(this.business);
            if (this.description) {
                this.fillDescription(this.description);
            }
            if (this.comment) {
                this.fillComment(this.comment);
            }
            if (this.tags) {
                this.selectTags(this.tags);
            }
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a(n) application.`
            );
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
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, editButton);

        if (cancel) {
            cancelForm();
        } else {
            if (updatedValues.name && updatedValues.name != this.name) {
                this.fillName(updatedValues.name);
                this.name = updatedValues.name;
            }
            if (updatedValues.description && updatedValues.description != this.description) {
                this.fillDescription(updatedValues.description);
                this.description = updatedValues.description;
            }
            if (updatedValues.business && updatedValues.business != this.business) {
                this.selectBusinessService(updatedValues.business);
                this.business = updatedValues.business;
            }
            if (updatedValues.tags && updatedValues.tags != this.tags) {
                this.selectTags(updatedValues.tags);
                this.tags = updatedValues.tags;
            }
            if (updatedValues.comment && updatedValues.comment != this.comment) {
                this.fillComment(updatedValues.comment);
                this.comment = updatedValues.comment;
            }
            if (updatedValues) {
                submitForm();
            }
        }
    }

    delete(cancel = false): void {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                clickByText(button, deleteAction);
            });

        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
            cy.wait(2000);
        }
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
            ApplicationInventory.clickApplicationInventory();
            selectItemsPerPage(100);
            this.selectApplication();
            cy.waitForReact();
            cy.react("p", reactSelectorAssessButton).click();
            cy.wait(6000);
            if (stakeholders) this.selectStakeholders(stakeholders);
            if (stakeholdergroups) this.selectStakeholdergroups(stakeholdergroups);
            clickByText(button, next);
            cy.wait(1000);
            this.selectAnswers(risk);
        }
    }

    perform_review(risk): void {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        this.selectApplication();
        clickByText(button, review);
        cy.wait(8000);
        this.selectMigrationAction(risk);
        this.selectEffortEstimate(risk);
        this.fillCriticality(risk);
        this.fillPriority(risk);
        clickByText(button, "Submit review");
    }

    is_assessed(): void {
        this.verifyCompleteStatus(assessmentColumnSelector);
    }

    is_reviewed(): void {
        this.verifyCompleteStatus(reviewColumnSelector);
    }

    getColumnText(columnSelector, columnText: string): void {
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                cy.get(columnSelector).find("span").should("contain", columnText);
            });
    }

    expandApplicationRow(): void {
        // displays row details by clicking on the expand button
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                cy.get(commonView.expandRow).then(($btn) => {
                    if ($btn.attr("aria-expanded") === "false") {
                        $btn.trigger("click");
                    }
                });
            });
    }

    closeApplicationRow(): void {
        // closes row details by clicking on the collapse button
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                cy.get(commonView.expandRow).then(($btn) => {
                    if ($btn.attr("aria-expanded") === "true") {
                        $btn.trigger("click");
                    }
                });
            });
    }

    existsWithinRow(rowIdentifier: string, fieldId: string, valueToSearch: string): void {
        // Verifies if the valueToSearch exists within the row
        cy.get(tdTag)
            .contains(rowIdentifier)
            .parent(tdTag)
            .parent(trTag)
            .next()
            .find(tags)
            .contains(fieldId)
            .parent("dt")
            .next()
            .should("contain", valueToSearch);
    }

    // Opens the manage dependencies dialog from application inventory page
    openManageDependencies(): void {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, actionButton);
        cy.wait(500);
        clickByText(button, "Manage dependencies");
    }

    // Selects the application as dependency from dropdown. Arg dropdownNum value 0 selects northbound, whereas value 1 selects southbound
    selectDependency(dropdownNum: number, appNameList: Array<string>): void {
        appNameList.forEach(function (app) {
            cy.get(dependenciesDropdownBtn).eq(dropdownNum).click();
            cy.contains("button", app).click();
        });
    }

    // Add/Remove north or south bound dependency for an application
    addDependencies(northbound?: Array<string>, southbound?: Array<string>): void {
        if (northbound || southbound) {
            this.openManageDependencies();
            cy.wait(1000);
            if (northbound.length > 0) {
                this.selectDependency(0, northbound);
            }
            if (southbound.length > 0) {
                this.selectDependency(1, southbound);
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

    verifyTagCount(tagsCount: number): void {
        // Verify tag count for specific application
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(4000);
        cy.get(".pf-c-table > tbody > tr")
            .not(".pf-c-table__expandable-row")
            .each(($ele) => {
                if ($ele.find(`td[data-label="${name}"]`).text() == this.name) {
                    expect(parseInt($ele.find(`td[data-label="${tagCount}"]`).text())).to.equal(
                        tagsCount
                    );
                }
            });
    }

    verifyCopyAssessmentDisabled(): void {
        ApplicationInventory.clickApplicationInventory();
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

    copy_assessment(applicationList: Array<ApplicationInventory>, cancel = false): void {
        this.openCopyAssessmentModel();
        this.selectApps(applicationList);
        if (cancel) {
            cancelForm();
        } else {
            click(copy);
            cy.wait(2000);
        }
    }

    selectApps(applicationList: Array<ApplicationInventory>): void {
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
        ApplicationInventory.clickApplicationInventory();
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

    selectItemsPerPage(items: number): void {
        cy.wait(2000);
        cy.get(".pf-m-compact")
            .eq(1)
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
}
