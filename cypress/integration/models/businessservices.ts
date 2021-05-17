import {
    controls,
    businessservices,
    tdTag,
    trTag,
    button,
    createNewButton,
} from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import {
    businessServiceNameInput,
    businessServiceDescriptionInput,
    businessServiceOwnerSelect,
} from "../views/businessservices.view";
import {
    confirmButton,
    editButton,
    deleteButton,
    successAlertMessage,
} from "../views/commoncontrols.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    selectFormItems,
    checkSuccessAlert,
} from "../../utils/utils";
import * as faker from "faker";

export class BusinessServices {
    businessServiceName: string = this.getBusinessServiceName();
    businessServiceDescription: string = this.getBusinessServiceDescription();

    protected static clickBusinessservices(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
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

    getBusinessServiceName(): string {
        return faker.company.companyName();
    }

    getBusinessServiceDescription(): string {
        return faker.lorem.sentence();
    }

    create({
        name = this.businessServiceName,
        description = this.businessServiceDescription,
        owner = null,
        cancel = false,
    } = {}): void {
        BusinessServices.clickBusinessservices();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.getBusinessServiceName();
            this.getBusinessServiceDescription();
            this.fillName(name);
            this.fillDescription(description);
            if (owner) {
                this.selectOwner(owner);
            }
            submitForm();
            checkSuccessAlert(
                successAlertMessage,
                `Success! ${this.businessServiceName} was added as a business service.`
            );
        }
    }

    edit({
        name = this.businessServiceName,
        description = this.businessServiceDescription,
        owner = null,
        cancel = false,
    } = {}): void {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.businessServiceName)
            .parent(trTag)
            .within(() => {
                click(editButton);
            });

        if (
            !cancel &&
            (name !== this.businessServiceName ||
                description !== this.businessServiceDescription ||
                owner)
        ) {
            this.fillName(name);
            this.fillDescription(description);
            if (owner) {
                this.selectOwner(owner);
            }
            submitForm();
            this.businessServiceName = name;
        } else {
            cancelForm();
        }
    }

    delete({ name = this.businessServiceName, cancel = false } = {}): void {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(name)
            .parent(trTag)
            .within(() => {
                click(deleteButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            click(confirmButton);
        }
    }

    exists({ name = this.businessServiceName } = {}) {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("contain", name);
    }

    notExists({ name = this.businessServiceName } = {}) {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("not.contain", name);
    }
}
