import { controls, stakeholders, tdTag, trTag } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import { 
    stakeholderNameInput,
    stakeholderEmailInput,
    jobfunctionInput,
    groupInput 
} from "../views/stakeholders.view";
import { confirmButton,
    editButton,
    deleteButton
} from "../views/commoncontrols.view";
import { clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    selectFormItems,
    removeMember
} from "../../utils/utils";
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
        this.stakeholderName = faker.name.findName();
        return this.stakeholderName;
    }

    getStakeholderEmail(): string {
        this.stakeholderEmail = faker.internet.email();
        return this.stakeholderEmail;
    }

    create(jobfunction?: string, groups?: Array<string>): void {
        Stakeholders.clickStakeholders();
        clickByText("button", "Create new");
        this.getStakeholderName();
        this.getStakeholderEmail();
        this.fillEmail(this.stakeholderEmail);
        this.fillName(this.stakeholderName);
        if (jobfunction) {
            this.selectJobfunction(jobfunction);
        }
        if (groups) {
            this.selectGroups(groups);
        }
        submitForm();
    }

    edit(jobfunction?: string, addGroups?: Array<string>, removeGroups?: Array<string>): void {
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
        if (jobfunction) {
            this.selectJobfunction(jobfunction);
        }
        if (addGroups) {
            this.selectGroups(addGroups);
        }
        if (removeGroups) {
            this.removeGroups(removeGroups);
        }
        submitForm();
    }

    delete(stakeholderEmail: string = this.stakeholderEmail): void {
        Stakeholders.clickStakeholders();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(stakeholderEmail)
            .parent(trTag)
            .within(() => {
                click(deleteButton);
            });
        click(confirmButton);
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
