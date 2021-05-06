import { controls, jobFunctions, tdTag, trTag } from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import { jobfunctionNameInput } from "../views/jobfunctions.view";
import { confirmButton,
  editButton,
  deleteButton 
} from "../views/commoncontrols.view";
import { clickByText, inputText, click, selectItemsPerPage, submitForm } from "../../utils/utils";
import * as faker from "faker";
export class Jobfunctions {

  jobFunctionName;

  protected static clickJobfunctions(): void {
    clickByText(navMenu, controls);
    clickByText(navTab, jobFunctions);
  }

  protected fillName(name: string): void {
    inputText(jobfunctionNameInput, name);
  }

  getJobFuncName(): string {
    this.jobFunctionName = faker.name.jobType();
    return this.jobFunctionName;
  }

  create(): void {
    Jobfunctions.clickJobfunctions();
    clickByText("button", "Create new");
    this.getJobFuncName();
    this.fillName(this.jobFunctionName);
    submitForm();
  }

  edit(): void {
    Jobfunctions.clickJobfunctions();
    selectItemsPerPage(100);
    cy.wait(2000);
    cy.get(tdTag)
      .contains(this.jobFunctionName)
      .parent(trTag)
      .within(() => {
        click(editButton);
    });
    this.getJobFuncName();
    this.fillName(this.jobFunctionName);
    submitForm();
  }

  delete(): void {
    Jobfunctions.clickJobfunctions();
    selectItemsPerPage(100);
    cy.wait(2000);
    cy.get(tdTag)
      .contains(this.jobFunctionName)
      .parent(trTag)
      .within(() => {
        click(deleteButton);
    });
    click(confirmButton);
  }
}