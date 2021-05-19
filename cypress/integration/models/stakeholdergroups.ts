import {
    controls,
    stakeholdergroups,
    tdTag,
    trTag,
    button,
    createNewButton,
} from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import {
    stakeholdergroupNameInput,
    stakeholdergroupDescriptionInput,
    stakeholdergroupMemberSelect,
} from "../views/stakeholdergroups.view";
import * as commonView from "../views/commoncontrols.view";
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

export class Stakeholdergroups {
    name: string;
    description: string;
    members: Array<string>;

    constructor(name: string, description?: string, members?: Array<string>) {
        this.name = name;
        if (description) this.description = description;
        if (members) this.members = members;
    }

    protected static clickStakeholdergroups(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
    }

    protected fillName(name: string): void {
        inputText(stakeholdergroupNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(stakeholdergroupDescriptionInput, description);
    }

    protected selectMembers(members: Array<string>): void {
        members.forEach(function (member) {
            selectFormItems(stakeholdergroupMemberSelect, member);
        });
    }

    create(cancel = false): void {
        Stakeholdergroups.clickStakeholdergroups();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.fillDescription(this.description);
            if (this.members) {
                this.selectMembers(this.members);
            }
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a stakeholder group.`
            );
        }
    }

    edit(
        updatedValue: {
            name?: string,
            description?: string,
            members?: Array<string>
        },
        cancel = false
    ): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(trTag)
            .within(() => {
                click(commonView.editButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                this.fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.description && updatedValue.description != this.description) {
                this.fillDescription(updatedValue.description);
                this.description = updatedValue.description;
            }
            if (updatedValue.members && updatedValue.members.length != 0) {
                this.selectMembers(updatedValue.members);
                this.members = updatedValue.members;
            }
            if (updatedValue) submitForm();
        }
    }

    delete(cancel = false): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.name)
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

    exists(name = this.name) {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("contain", name);
    }

    notExists(name = this.name) {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("not.contain", name);
    }
}
