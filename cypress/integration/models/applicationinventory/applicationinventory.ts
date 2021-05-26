import {
    applicationinventory,
    tdTag,
    trTag,
    button,
    createNewButton,
    deleteAction,
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
}
