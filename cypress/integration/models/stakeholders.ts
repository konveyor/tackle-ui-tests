import { controls, stakeholders, tdTag, trTag, button, createNewButton } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import {
    stakeholderNameInput,
    stakeholderEmailInput,
    jobfunctionInput,
    groupInput,
} from "../views/stakeholders.view";
import * as commonView from "../views/commoncontrols.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    selectFormItems,
    removeMember,
    cancelForm,
    checkSuccessAlert,
} from "../../utils/utils";
import * as faker from "faker";

export class Stakeholders {
    stakeholderName: string = this.getStakeholderName();
    stakeholderEmail: string = this.getStakeholderEmail();

    protected static clickStakeholders(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholders);
    }

    protected fillName(name: string): void {
        inputText(stakeholderNameInput, name);
    }

    protected fillEmail(email: string): void {
        inputText(stakeholderEmailInput, email);
    }

    protected selectJobfunction(jobfunction: string): void {
        selectFormItems(jobfunctionInput, jobfunction);
    }

    protected selectGroups(groups: Array<string>): void {
        groups.forEach(function (group) {
            selectFormItems(groupInput, group);
        });
    }

    protected removeGroups(groups: Array<string>): void {
        groups.forEach(function (group) {
            removeMember(group);
        });
    }

    getStakeholderName(): string {
        return faker.name.findName();
    }

    getStakeholderEmail(): string {
        return faker.internet.email();
    }

    create({
        name = this.stakeholderName,
        email = this.stakeholderEmail,
        jobfunction = null,
        groups = [],
        cancel = false,
    } = {}): void {
        Stakeholders.clickStakeholders();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillEmail(email);
            this.fillName(name);
            if (jobfunction) {
                this.selectJobfunction(jobfunction);
            }
            if (groups.length != 0) {
                this.selectGroups(groups);
            }
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${name} was added as a stakeholder.`
            );
        }
    }

    edit({
        name = this.stakeholderName,
        email = this.stakeholderEmail,
        jobfunction = null,
        groups = [],
        cancel = false,
    } = {}): void {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.stakeholderEmail)
            .parent(trTag)
            .within(() => {
                click(commonView.editButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            if (
                name != this.stakeholderName ||
                email != this.stakeholderEmail ||
                jobfunction ||
                groups.length != 0
            ) {
                this.fillName(name);
                if (email != this.stakeholderEmail) this.fillEmail(email);
                if (jobfunction) this.selectJobfunction(jobfunction);
                if (groups.length != 0) this.selectGroups(groups);
                submitForm();
                this.stakeholderName = name;
                this.stakeholderEmail = email;
            } else {
                cy.get(commonView.submitButton).should("not.be.enabled");
            }
        }
    }

    delete({ email = this.stakeholderEmail, cancel = false } = {}): void {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(email)
            .parent(trTag)
            .within(() => {
                click(commonView.deleteButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
    }

    exists(email?: string) {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        this.stakeholderEmail = email || this.stakeholderEmail;
        cy.get(tdTag).should("contain", this.stakeholderEmail);
    }

    notExists(email?: string) {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        this.stakeholderEmail = email || this.stakeholderEmail;
        cy.get(tdTag).should("not.contain", this.stakeholderEmail);
    }
}
