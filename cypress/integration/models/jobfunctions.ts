import { controls, jobfunctions, tdTag, trTag } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import { jobfunctionNameInput } from "../views/jobfunctions.view";
import * as commonView from "../views/commoncontrols.view";
import { clickByText, inputText, click, selectItemsPerPage, submitForm } from "../../utils/utils";
import * as faker from "faker";

export class Jobfunctions {
    jobfunctionName= faker.name.jobType();

    protected static clickJobfunctions(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, jobfunctions);
    }

    protected fillName(name: string): void {
        inputText(jobfunctionNameInput, name);
    }

    create(name: string = this.jobfunctionName): void {
        Jobfunctions.clickJobfunctions();
        clickByText("button", "Create new");
        this.fillName(name);
        submitForm();
    }

    edit(name: string = this.jobfunctionName, cancel:boolean = false): void {
        Jobfunctions.clickJobfunctions();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.jobfunctionName)
            .parent(trTag)
            .within(() => {
                click(commonView.editButton);
            });
        this.fillName(name);
        if (cancel){
            cy.get(commonView.cancelButton).click();
        }
        else{
            //submit only if updated name is different than current name
            if (name != this.jobfunctionName){
                submitForm();
            }
            else{
                cy.get(commonView.submitButton).should("not.be.enabled");
            }
            // Update the name of the instance if name is updated
            this.jobfunctionName = name
        } 
    }

    delete(): void {
        Jobfunctions.clickJobfunctions();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.jobfunctionName)
            .parent(trTag)
            .within(() => {
                click(commonView.deleteButton);
            });
        click(commonView.confirmButton);
    }
}
