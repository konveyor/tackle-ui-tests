import { controls, stakeholders, tdTag, button, createNewButton } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import {
    stakeholderNameInput,
    stakeholderEmailInput,
    jobfunctionInput,
    groupInput,
} from "../views/stakeholders.view";
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
    performRowAction,
} from "../../utils/utils";
import * as commonView from "../views/common.view";

export class Stakeholders {
    name: string;
    email: string;
    jobfunction: string;
    groups: Array<string>;

    constructor(email: string, name: string, jobfunction?: string, groups?: Array<string>) {
        this.email = email;
        this.name = name;
        if (jobfunction) this.jobfunction = jobfunction;
        if (groups) this.groups = groups;
    }

    public static clickStakeholders(): void {
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

    create(cancel = false): void {
        Stakeholders.clickStakeholders();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillEmail(this.email);
            this.fillName(this.name);
            if (this.jobfunction) {
                this.selectJobfunction(this.jobfunction);
            }
            if (this.groups) {
                this.selectGroups(this.groups);
            }
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a stakeholder.`
            );
        }
    }

    edit(
        updatedValue: {
            email?: string;
            name?: string;
            jobfunction?: string;
            groups?: Array<string>;
        },
        cancel = false
    ): void {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.email, commonView.editButton, false);
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.email && updatedValue.email != this.email) {
                this.fillEmail(updatedValue.email);
                this.email = updatedValue.email;
            }
            if (updatedValue.name && updatedValue.name != this.name) {
                this.fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.jobfunction && updatedValue.jobfunction != this.jobfunction) {
                this.selectJobfunction(updatedValue.jobfunction);
                this.jobfunction = updatedValue.jobfunction;
            }
            if (updatedValue.groups && updatedValue.groups.length != 0) {
                this.selectGroups(updatedValue.groups);
                this.groups = updatedValue.groups;
            }
            if (updatedValue) submitForm();
        }
    }

    delete(cancel = false): void {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.email, commonView.deleteButton, false);
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
    }
}
