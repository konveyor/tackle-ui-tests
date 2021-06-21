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
    stakeholderSelect,
    stakeholdergroupsSelect,
    selectInput,
    criticalityInput,
    priorityInput,
    questionBlock,
    radioInput,
    assessmentColumnSelector,
    reviewColumnSelector,
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
        if (risk === "low") {
            const migrationActions = ["Replatform", "Repurchase", "Retain"];
            var action = migrationActions[Math.floor(Math.random() * migrationActions.length)];
            cy.get(selectInput).eq(0).click();
            cy.contains(button, action).click();
        }
    }

    protected selectEffortEstimate(risk: string): void {
        if (risk === "low") {
            cy.get(selectInput).eq(1).click();
            cy.contains(button, "Small").click();
        }
    }

    protected fillCriticality(risk: string): void {
        if (risk === "low") {
            inputText(criticalityInput, data.getRandomNumber(1, 4));
        }
    }

    protected fillPriority(risk: string): void {
        if (risk === "low") {
            inputText(priorityInput, data.getRandomNumber(1, 4));
        }
    }

    protected selectApplication(): void {
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(selectBox);
            });
    }

    protected selectAnswer(risk: string): void {
        for (let i = 0; i < 5; i++) {
            cy.get(questionBlock).each(($question) => {
                var totalOptions = $question.find("div.pf-l-stack").children("div").length;
                var optionToSelect: number;
                if (risk === "low") {
                    optionToSelect = totalOptions - 1;
                } else if (risk === "medium") {
                    optionToSelect = totalOptions / 2 - 1;
                } else {
                    optionToSelect = 1;
                }
                cy.wrap($question)
                    .find("div.pf-l-stack")
                    .children("div")
                    .eq(optionToSelect)
                    .find(radioInput)
                    .check();
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
                "Atleast one arg out of stakeholder or stakeholder group must be provided !"
            ).to.equal(true);
        } else {
            ApplicationInventory.clickApplicationInventory();
            selectItemsPerPage(100);
            cy.wait(2000);
            this.selectApplication();
            clickByText(button, assess);
            cy.wait(2000);
            if (stakeholders) this.selectStakeholders(stakeholders);
            if (stakeholdergroups) this.selectStakeholdergroups(stakeholdergroups);
            clickByText(button, next);
            cy.wait(200);
            this.selectAnswer(risk);
        }
    }

    perform_review(risk): void {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        this.selectApplication();
        clickByText(button, review);
        cy.wait(2000);
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
