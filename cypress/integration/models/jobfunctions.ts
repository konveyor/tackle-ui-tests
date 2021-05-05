import {controls, jobFunctions, tdTag, trTag} from '../types/constants';
import {navMenu, navTab} from '../views/menu.view';
import {jobfuncttionNameInput, 
    jobfunctionCreateButton, 
    jobfunctionDelete, 
    jobfunctionConfirmDelete,
    jobfunctionEdit
} from '../views/jobfunctions.view'
import {clickByText, inputText, click} from '../../utils/utils';


export class Jobfunctions {
    protected static clickJobfunctions(): void {
      clickByText(navMenu, controls);
      clickByText(navTab, jobFunctions);
    }

    protected fillName(name: string): void {
        inputText(jobfuncttionNameInput, name);
      }

    create(): void {
        Jobfunctions.clickJobfunctions();
        clickByText("button", "Create new");
        this.fillName("new_job_function");
        click(jobfunctionCreateButton);
    }

    edit(): void {
        Jobfunctions.clickJobfunctions();
        cy.get(tdTag)
          .contains("Business Analyst")
          .parent(trTag)
          .within(() => {
            click(jobfunctionEdit);
          });
        this.fillName("new_job_function");
        clickByText("button", "Save");
        // click(jobfunctionCreateButton);
      }

    delete(): void {
        Jobfunctions.clickJobfunctions();
        cy.get(tdTag)
          .contains("asdsad")
          .parent(trTag)
          .within(() => {
            click(jobfunctionDelete);
          });
        click(jobfunctionConfirmDelete);
      }
}