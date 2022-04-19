import { controls, businessServices, tdTag, button, createNewButton } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import {
    businessServiceNameInput,
    businessServiceDescriptionInput,
    businessServiceOwnerSelect,
} from "../views/businessservices.view";

import * as commonView from "../views/common.view";

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
    selectUserPerspective
} from "../../utils/utils";

export class BusinessServices {
    name: string;
    description: string;
    owner: string;

    constructor(name: string, description?: string, owner?: string) {
        this.name = name;
        if (description) this.description = description;
        if (owner) this.owner = owner;
    }

    public static clickBusinessservices(): void {
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
    }

    protected fillName(name: string): void {
        inputText(businessServiceNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(businessServiceDescriptionInput, description);
    }

    protected selectOwner(owner: string): void {
        selectFormItems(businessServiceOwnerSelect, owner);
    }

    create(cancel = false): void {
        BusinessServices.clickBusinessservices();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            if (this.description) {
                this.fillDescription(this.description);
            }
            if (this.owner) {
                this.selectOwner(this.owner);
            }
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a business service.`
            );
        }
    }

    edit(
        updateValues: {
            name?: string;
            description?: string;
            owner?: string;
        },
        cancel = false
    ): void {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, commonView.editButton);

        if (cancel) {
            cancelForm();
        } else {
            if (updateValues.name && updateValues.name != this.name) {
                this.fillName(updateValues.name);
                this.name = updateValues.name;
            }
            if (updateValues.description && updateValues.description != this.description) {
                this.fillDescription(updateValues.description);
                this.description = updateValues.description;
            }
            if (updateValues.owner && updateValues.owner != this.owner) {
                this.selectOwner(updateValues.owner);
                this.owner = updateValues.owner;
            }
            if (updateValues) {
                submitForm();
            }
        }
    }

    delete(cancel = false): void {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, commonView.deleteButton);
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
    }
}
