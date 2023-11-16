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
    stakeholders,
    button,
    createNewButton,
    editAction,
    deleteAction,
    migration,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    stakeholderNameInput,
    stakeholderEmailInput,
    jobfunctionInput,
    groupInput,
    removeJobFunction,
} from "../../../views/stakeholders.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    selectFormItems,
    removeMember,
    cancelForm,
    performRowAction,
    selectUserPerspective,
} from "../../../../utils/utils";
import * as commonView from "../../../views/common.view";

export class Stakeholders {
    name: string;
    email: string;
    jobfunction: string;
    groups: Array<string>;
    static fullUrl = Cypress.env("tackleUrl") + "controls/stakeholders";

    constructor(email: string, name: string, jobfunction?: string, groups?: Array<string>) {
        this.email = email;
        this.name = name;
        if (jobfunction) this.jobfunction = jobfunction;
        if (groups) this.groups = groups;
    }

    public static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != Stakeholders.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                clickByText(navTab, stakeholders);
            }
        });
        selectItemsPerPage(itemsPerPage);
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
        performRowAction(this.email, editAction);
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
        performRowAction(this.email, editAction);
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
        performRowAction(this.email, deleteAction);
        if (cancel) {
            click(commonView.confirmCancelButton);
        } else {
            click(commonView.confirmButton);
        }
    }
}
