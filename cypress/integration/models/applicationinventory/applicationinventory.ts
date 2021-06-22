import {
    applicationinventory,
    tdTag,
    trTag,
    button,
    createNewButton,
    deleteAction,
    assess,
    next,
    review,
    save,
} from "../../types/constants";
import { navMenu } from "../../views/menu.view";
import {
    applicationNameInput,
    applicationDescriptionInput,
    applicationBusinessServiceSelect,
    applicationTagsSelect,
    applicationCommentInput,
    editButton,
    actionButton,
    selectBox,
} from "../../views/applicationinventory.view";
import * as commonView from "../../views/common.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    selectFormItems,
    checkSuccessAlert,
} from "../../../utils/utils";
import * as data from "../../../utils/data_utils";
import {
    assessmentColumnSelector,
    questionBlock,
    radioInput,
    stakeholdergroupsSelect,
    stakeholderSelect,
} from "../../views/assessment.view";
import {
    criticalityInput,
    priorityInput,
    reviewColumnSelector,
    selectInput,
} from "../../views/review.view";

export class ApplicationInventory {
    name: string;
    description: string;
    business: string;
    tags: Array<string>;
    comment: string;

    constructor(
        name: string,
        description?: string,
        comment?: string,
        business?: string,
        tags?: Array<string>
    ) {
        this.name = name;
        if (description) this.description = description;
        if (comment) this.comment = comment;
        if (business) this.business = business;
        if (tags) this.tags = tags;
    }
    protected static clickApplicationInventory(): void {
        clickByText(navMenu, applicationinventory);
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

    protected selectApplication(): void {
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(selectBox);
                cy.wait(500);
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
            if (this.description) {
                this.fillDescription(this.description);
            }
            if (this.comment) {
                this.fillComment(this.comment);
            }
            if (this.business) {
                this.selectBusinessService(this.business);
            }
            if (this.tags) {
                this.selectTags(this.tags);
            }
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a application.`
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
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(editButton);
            });

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
                this.name = updatedValues.name;
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
            })
            .contains(button, deleteAction)
            .click();

        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
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
            clickByText(button, assess);
            cy.wait(2000);
            if (stakeholders) this.selectStakeholders(stakeholders);
            if (stakeholdergroups) this.selectStakeholdergroups(stakeholdergroups);
            clickByText(button, next);
            cy.wait(500);
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
}
