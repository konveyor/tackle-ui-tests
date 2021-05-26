import { controls, jobfunctions, tdTag, trTag, button, createNewButton } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import { jobfunctionNameInput } from "../views/jobfunctions.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
} from "../../utils/utils";
import * as commonView from "../../integration/views/common.view";

export class Jobfunctions {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    protected static clickJobfunctions(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
    }

    protected fillName(name: string): void {
        inputText(jobfunctionNameInput, name);
    }

    create(cancel = false): void {
        Jobfunctions.clickJobfunctions();
        clickByText(button, createNewButton);
        this.fillName(this.name);
        submitForm();
    }

    edit(updatedName: string, cancel = false): void {
        Jobfunctions.clickJobfunctions();
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
            if (updatedName != this.name) {
                this.fillName(updatedName);
                this.name = updatedName;
                submitForm();
            }
        }
    }

    delete(cancel = false): void {
        Jobfunctions.clickJobfunctions();
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
}
