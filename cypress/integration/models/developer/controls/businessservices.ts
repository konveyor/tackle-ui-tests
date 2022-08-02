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
    businessServices,
    button,
    createNewButton,
    editAction,
    deleteAction,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    businessServiceNameInput,
    businessServiceDescriptionInput,
    businessServiceOwnerSelect,
} from "../../../views/businessservices.view";

import * as commonView from "../../../views/common.view";

import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    selectFormItems,
    checkSuccessAlert,
    performRowAction,
    selectUserPerspective,
} from "../../../../utils/utils";

export class BusinessServices {
    name: string;
    description: string;
    owner: string;

    constructor(name: string, description?: string, owner?: string) {
        this.name = name;
        if (description) this.description = description;
        if (owner) this.owner = owner;
    }

    public static clickBusinessservices(): void {
        selectUserPerspective("Developer");
        clickByText(navMenu, controls);
        clickByText(navTab, businessServices);
    }

    protected fillName(name: string): void {
        inputText(businessServiceNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(businessServiceDescriptionInput, description);
    }

    protected selectOwner(owner: string): void {
        selectFormItems(businessServiceOwnerSelect, owner);
    }

    create(cancel = false): void {
        BusinessServices.clickBusinessservices();
        clickByText(button, createNewButton);
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            if (this.description) {
                this.fillDescription(this.description);
            }
            if (this.owner) {
                this.selectOwner(this.owner);
            }
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a(n) business service.`
            );
        }
    }

    edit(
        updateValues: {
            name?: string;
            description?: string;
            owner?: string;
        },
        cancel = false
    ): void {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, editAction);

        if (cancel) {
            cancelForm();
        } else {
            if (updateValues.name && updateValues.name != this.name) {
                this.fillName(updateValues.name);
                this.name = updateValues.name;
            }
            if (updateValues.description && updateValues.description != this.description) {
                this.fillDescription(updateValues.description);
                this.description = updateValues.description;
            }
            if (updateValues.owner && updateValues.owner != this.owner) {
                this.selectOwner(updateValues.owner);
                this.owner = updateValues.owner;
            }
            if (updateValues) {
                submitForm();
            }
        }
    }

    delete(cancel = false): void {
        BusinessServices.clickBusinessservices();
        selectItemsPerPage(100);
        cy.wait(2000);
        performRowAction(this.name, deleteAction);
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
    }
}
