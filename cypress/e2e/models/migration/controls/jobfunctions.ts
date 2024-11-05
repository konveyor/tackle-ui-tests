/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {
    controls,
    jobFunctions,
    button,
    createNewButton,
    editAction,
    deleteAction,
    migration,
    SEC,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import { jobfunctionNameInput } from "../../../views/jobfunctions.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    performRowAction,
    selectUserPerspective,
} from "../../../../utils/utils";
import * as commonView from "../../../views/common.view";

export class Jobfunctions {
    name: string;
    static fullUrl = Cypress.env("tackleUrl") + "controls/job-functions";

    constructor(name: string) {
        this.name = name;
    }

    public static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != Jobfunctions.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Controls");
                clickByText(navTab, jobFunctions);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected fillName(name: string): void {
        inputText(jobfunctionNameInput, name);
    }

    create(cancel = false): void {
        Jobfunctions.openList();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            submitForm();
        }
    }

    edit(updatedName: string, cancel = false): void {
        Jobfunctions.openList();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, editAction);

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
        Jobfunctions.openList();
        performRowAction(this.name, deleteAction);
        if (cancel) {
            click(commonView.confirmCancelButton);
        } else {
            click(commonView.confirmButton);
        }
    }
}
