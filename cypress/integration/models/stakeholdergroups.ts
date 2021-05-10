import { controls, stakeholdergroups, tdTag, trTag } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import {
    stakeholdergroupNameInput,
    stakeholdergroupDescriptionInput,
    stakeholdergroupMemberSelect,
} from "../views/stakeholdergroups.view";
import { confirmButton, editButton, deleteButton } from "../views/commoncontrols.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    selectMember,
} from "../../utils/utils";
import * as faker from "faker";
import { memoize } from "cypress/types/lodash";

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
        selectMember(stakeholdergroupMemberSelect, member);
    }

    getStakeholdergroupName(): string {
        this.stakeholdergroupName = faker.company.companyName();
        return this.stakeholdergroupName;
    }

    getStakeholdergroupDescription(): string {
        this.stakeholdergroupDescription = faker.lorem.sentence();
        return this.stakeholdergroupDescription;
    }

    getCurrentstakeholdergroupName(): string {
        return this.stakeholdergroupName;
    }

    create(member?: string): void {
        Stakeholdergroups.clickStakeholdergroups();
        clickByText("button", "Create new");
        this.getStakeholdergroupName();
        this.getStakeholdergroupDescription();
        this.fillName(this.stakeholdergroupName);
        this.fillDescription(this.stakeholdergroupDescription);
        if (member) {
            this.selectMember(member);
        }
        submitForm();
    }

    edit(member?: string): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(editButton);
            });
        this.getStakeholdergroupName();
        this.getStakeholdergroupDescription();
        this.fillName(this.stakeholdergroupName);
        this.fillDescription(this.stakeholdergroupDescription);
        if (member) {
            this.selectMember(member);
        }
        // Implement edit stakeholder groups' member
        submitForm();
    }

    delete(): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(deleteButton);
            });
        click(confirmButton);
    }
}
