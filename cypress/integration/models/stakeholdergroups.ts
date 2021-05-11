import { controls, stakeholdergroups, tdTag, trTag } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import { stakeholdergroupName, stakeholdergroupDescription } from "../views/stakeholdergroups.view";
import { confirmButton, editButton, deleteButton } from "../views/commoncontrols.view";
import { clickByText, inputText, click, selectItemsPerPage, submitForm } from "../../utils/utils";
import * as faker from "faker";

export class Stakeholdergroups {
    stakeholdergroupName;
    stakeholdergroupDescription;

    protected static clickStakeholdergroups(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
    }

    protected fillName(name: string): void {
        inputText(stakeholdergroupName, name);
    }

    protected fillDescription(description: string): void {
        inputText(stakeholdergroupDescription, description);
    }

    getStakeholdergroupName(): string {
        this.stakeholdergroupName = faker.company.companyName();
        return this.stakeholdergroupName;
    }

    getStakeholdergroupDescription(): string {
        this.stakeholdergroupDescription = faker.lorem.sentence();
        return this.stakeholdergroupDescription;
    }

    create(): void {
        Stakeholdergroups.clickStakeholdergroups();
        clickByText("button", "Create new");
        this.getStakeholdergroupName();
        this.getStakeholdergroupDescription();
        this.fillName(this.stakeholdergroupName);
        this.fillDescription(this.stakeholdergroupDescription);
        submitForm();
    }

    edit(): void {
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
        // Implement edit stakeholder groups' member
        submitForm();
    }

    delete(stakeholdergroupName: string = this.stakeholdergroupName): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(deleteButton);
            });
        click(confirmButton);
    }
}
