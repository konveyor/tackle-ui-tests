import { controls, stakeholders, tdTag, trTag } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import { stakeholderNameInput, stakeholderEmailInput } from "../views/stakeholders.view";
import { confirmButton, editButton, deleteButton } from "../views/commoncontrols.view";
import { clickByText, inputText, click, selectItemsPerPage, submitForm } from "../../utils/utils";
import * as faker from "faker";

export class Stakeholders {
    stakeholderName;
    stakeholderEmail;

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

    getStakeholderName(): string {
        this.stakeholderName = faker.name.findName();
        return this.stakeholderName;
    }

    getStakeholderEmail(): string {
        this.stakeholderEmail = faker.internet.email();
        return this.stakeholderEmail;
    }

    create(): void {
        Stakeholders.clickStakeholders();
        clickByText("button", "Create new");
        this.getStakeholderName();
        this.getStakeholderEmail();
        this.fillEmail(this.stakeholderEmail);
        this.fillName(this.stakeholderName);
        submitForm();
    }

    edit(jobFunction?: boolean, groups?: boolean): void {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.stakeholderEmail)
            .parent(trTag)
            .within(() => {
                click(editButton);
            });
        this.getStakeholderName();
        this.fillName(this.stakeholderName);
        // jobfunction and group edit to be implemented
        submitForm();
    }

    delete(): void {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.stakeholderEmail)
            .parent(trTag)
            .within(() => {
                click(deleteButton);
            });
        click(confirmButton);
    }
}
