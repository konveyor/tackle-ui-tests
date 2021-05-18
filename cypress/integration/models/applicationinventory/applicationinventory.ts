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
import { confirmButton, successAlertMessage } from "../../views/common.view";
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
import * as faker from "faker";

export class ApplicationInventory {
    applicationName: string = this.getApplicationName();
    applicationDescription: string = this.getApplicationDescription();
    applicationComment: string = this.getApplicationComment();

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

    protected selectTags(tag: string): void {
        selectFormItems(applicationTagsSelect, tag);
    }

    getApplicationName(): string {
        return faker.name.findName();
    }

    getApplicationDescription(): string {
        return faker.lorem.sentence();
    }

    getApplicationComment(): string {
        return faker.lorem.sentence();
    }

    create({
        name = this.applicationName,
        description = this.applicationDescription,
        businessservice = null,
        tags = null,
        comment = this.applicationComment,
        cancel = false,
    } = {}): void {
        ApplicationInventory.clickApplicationInventory();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(name);
            this.fillDescription(description);
            this.fillComment(comment);
            if (businessservice) {
                this.selectBusinessService(businessservice);
            }
            if (tags) {
                this.selectTags(tags);
            }
            submitForm();
            checkSuccessAlert(successAlertMessage, `Success! ${name} was added as a application.`);
        }
    }

    edit({
        name = this.applicationName,
        description = this.applicationDescription,
        businessservice = null,
        tags = null,
        comment = this.applicationComment,
        cancel = false,
    } = {}): void {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.applicationName)
            .parent(trTag)
            .within(() => {
                click(editButton);
            });

        if (
            !cancel &&
            (name !== this.applicationName ||
                description !== this.applicationDescription ||
                businessservice ||
                tags ||
                comment != this.applicationComment)
        ) {
            this.fillName(name);
            this.fillDescription(description);
            this.fillComment(comment);
            if (businessservice) {
                this.selectBusinessService(businessservice);
            }
            if (tags) {
                this.selectTags(tags);
            }
            submitForm();
            this.applicationName = name;
        } else {
            cancelForm();
        }
    }

    delete({ name = this.applicationName, cancel = false } = {}): void {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(name)
            .parent(trTag)
            .within(() => {
                click(actionButton);
            })
            .contains(button, deleteAction)
            .click();

        if (cancel) {
            cancelForm();
        } else {
            click(confirmButton);
        }
    }

    exists({ name = this.applicationName } = {}) {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("contain", name);
    }

    notExists({ name = this.applicationName } = {}) {
        ApplicationInventory.clickApplicationInventory();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("not.contain", name);
    }
}
