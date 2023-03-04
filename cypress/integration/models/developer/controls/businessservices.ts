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
    SEC,
    trTag,
    migration,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    businessServiceNameInput,
    businessServiceDescriptionInput,
    businessServiceOwnerSelect,
    buzinessServiceLabels,
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
    goToPage,
    goToLastPage,
} from "../../../../utils/utils";

export class BusinessServices {
    name: string;
    description: string;
    owner: string;

    static fullUrl = Cypress.env("tackleUrl") + "/controls/business-services";

    constructor(name, description?, owner?: string) {
        this.name = name;
        if (description) this.description = description;
        if (owner) this.owner = owner;
    }

    public static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != BusinessServices.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                clickByText(navTab, businessServices);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    // TODO: Refactor this method so that it will return list from particular page or full list, to take into account amount of items per page
    public static getList(amountPerPage = 100, pageNumber?: number) {
        this.openList(amountPerPage);
        if (pageNumber) {
            goToPage(pageNumber);
        }
        return new Promise<BusinessServices[]>((resolve) => {
            let list = [];
            cy.get(commonView.appTable, { timeout: 15 * SEC })
                .find(trTag)
                .each(($row) => {
                    let name = $row.find(buzinessServiceLabels.name).text();
                    if (name) {
                        list.push(new BusinessServices(name));
                    }
                })
                .then(() => {
                    resolve(list);
                });
        });
    }

    public static getNamesListOnPage(amountPerPage = 10, pageNumber?: number, lastPage = false) {
        this.openList(amountPerPage);
        if (pageNumber) {
            goToPage(pageNumber);
        } else if (lastPage) {
            goToLastPage();
        }
        return new Promise<string[]>((resolve) => {
            let list = [];
            cy.get(commonView.appTable, { timeout: 15 * SEC })
                .find(trTag)
                .each(($row) => {
                    let name = $row.find(buzinessServiceLabels.name).text();
                    list.push(new BusinessServices(name));
                })
                .then(() => {
                    resolve(list);
                });
        });
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
        BusinessServices.openList();
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
        BusinessServices.openList();
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
        BusinessServices.openList();
        performRowAction(this.name, deleteAction);
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
        }
        cy.wait(2000);
    }
}
