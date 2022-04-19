import { controls, jobFunctions, tdTag, button, createNewButton } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import { jobfunctionNameInput } from "../views/jobfunctions.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    performRowAction,
} from "../../utils/utils";
import * as commonView from "../../integration/views/common.view";

export class Jobfunctions {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    public static clickJobfunctions(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, jobFunctions);
    }

    protected fillName(name: string): void {
        inputText(jobfunctionNameInput, name);
    }

    create(cancel = false): void {
        Jobfunctions.clickJobfunctions();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            submitForm();
        }
    }

    edit(updatedName: string, cancel = false): void {
        Jobfunctions.clickJobfunctions();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, commonView.editButton);

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
        performRowAction(this.name, commonView.deleteButton);
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
    }
}
