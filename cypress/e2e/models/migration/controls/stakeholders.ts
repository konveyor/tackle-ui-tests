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
    cancelForm,
    click,
    clickByText,
    clickItemInKebabMenu,
    inputText,
    performRowActionByIcon,
    removeMember,
    selectFormItems,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import {
    button,
    controls,
    createNewButton,
    deleteAction,
    migration,
    SEC,
    stakeholders,
} from "../../../types/constants";
import * as commonView from "../../../views/common.view";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    groupInput,
    jobfunctionInput,
    removeJobFunction,
    stakeholderEmailInput,
    stakeholderNameInput,
} from "../../../views/stakeholders.view";

export class Stakeholders {
    name: string;
    email: string;
    jobfunction: string;
    groups: Array<string>;
    static fullUrl = Cypress.config("baseUrl") + "/controls/stakeholders";

    constructor(email: string, name: string, jobfunction?: string, groups?: Array<string>) {
        this.email = email;
        this.name = name;
        if (jobfunction) this.jobfunction = jobfunction;
        if (groups) this.groups = groups;
    }

    public static openList(forceReload = false): void {
        if (forceReload) {
            cy.visit(Stakeholders.fullUrl, { timeout: 35 * SEC }).then((_) => {
                cy.wait(10 * SEC);
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Controls");
                selectItemsPerPage(100);
            });
            return;
        }

        cy.url().then(($url) => {
            if ($url != Stakeholders.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Controls");
                clickByText(navTab, stakeholders);
            }
        });
        cy.get("h1", { timeout: 30 * SEC }).should("contain.text", "Controls");
        selectItemsPerPage(100);
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

    removeJobfunction(): void {
        performRowActionByIcon(this.email, commonView.pencilIcon);
        click(removeJobFunction);
        submitForm();
    }

    create(cancel = false): void {
        Stakeholders.openList();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillEmail(this.email);
            this.fillName(this.name);
            if (this.jobfunction) {
                this.selectJobfunction(this.jobfunction);
            }
            if (this.groups) {
                this.selectGroups(this.groups);
            }
            submitForm();
        }
    }

    edit(
        updatedValue: {
            email?: string;
            name?: string;
            jobfunction?: string;
            groups?: Array<string>;
        },
        cancel = false
    ): void {
        Stakeholders.openList();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowActionByIcon(this.email, commonView.pencilIcon);
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.email && updatedValue.email != this.email) {
                this.fillEmail(updatedValue.email);
                this.email = updatedValue.email;
            }
            if (updatedValue.name && updatedValue.name != this.name) {
                this.fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.jobfunction && updatedValue.jobfunction != this.jobfunction) {
                this.selectJobfunction(updatedValue.jobfunction);
                this.jobfunction = updatedValue.jobfunction;
            }
            if (updatedValue.groups && updatedValue.groups.length != 0) {
                this.selectGroups(updatedValue.groups);
                this.groups = updatedValue.groups;
            }
            if (updatedValue) submitForm();
        }
    }

    delete(cancel = false): void {
        Stakeholders.openList();
        clickItemInKebabMenu(this.email, deleteAction);
        if (cancel) {
            click(commonView.confirmCancelButton);
        } else {
            click(commonView.confirmButton);
        }
    }
}
