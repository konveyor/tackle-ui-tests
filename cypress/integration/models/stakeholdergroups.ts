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

export class Stakeholdergroups {
    stakeholdergroupName;
    stakeholdergroupDescription;

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

    protected selectMember(member: string): void {
        selectFormItems(stakeholdergroupMemberSelect, member);
    }

    getStakeholdergroupName(): string {
        this.stakeholdergroupName = faker.company.companyName();
        return this.stakeholdergroupName;
    }

    getNewStakeholdergroupName(): string {
        return faker.company.companyName();
    }

    getStakeholdergroupDescription(): string {
        this.stakeholdergroupDescription = faker.lorem.sentence();
        return this.stakeholdergroupDescription;
    }

    create({ member = null, cancel = false } = {}): void {
        Stakeholdergroups.clickStakeholdergroups();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.getStakeholdergroupName();
            this.getStakeholdergroupDescription();
            this.fillName(this.stakeholdergroupName);
            this.fillDescription(this.stakeholdergroupDescription);
            if (member) {
                this.selectMember(member);
            }
            submitForm();
            checkSuccessAlert(
                successAlertMessage,
                `Success! ${this.stakeholdergroupName} was added as a stakeholder group.`
            );
        }
    }

    edit({
        name = this.stakeholdergroupName,
        description = this.stakeholdergroupName,
        member = null,
        cancel = false,
    } = {}): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(editButton);
            });

        if (
            !cancel &&
            (name !== this.stakeholdergroupName ||
                description !== this.stakeholdergroupDescription ||
                member)
        ) {
            this.fillName(name);
            this.fillDescription(this.stakeholdergroupDescription);
            if (member) {
                this.selectMember(member);
            }
            submitForm();
            this.stakeholdergroupName = name;
        } else {
            cancelForm();
        }
    }

    delete({ name = this.stakeholdergroupName, cancel = false } = {}): void {
        Stakeholdergroups.clickStakeholdergroups();
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

    exists({ name = this.stakeholdergroupName } = {}) {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("contain", name);
    }

    notExists({ name = this.stakeholdergroupName } = {}) {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag).should("not.contain", name);
    }
}
