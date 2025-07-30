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
    closeSuccessAlert,
    confirm,
    exists,
    performRowActionByIcon,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import {
    button,
    controls,
    deleteAction,
    migration,
    SEC,
    tags,
    tdTag,
    trTag,
} from "../../../types/constants";
import * as commonView from "../../../views/common.view";
import { navMenu, navTab } from "../../../views/menu.view";
import { colorMenuToggle, createTagCategoryButton } from "../../../views/tags.view";
import { clickTags, fillName } from "./tags";

export class TagCategory {
    name: string;
    fieldId: "color";
    color: string;

    constructor(name: string, color: string) {
        this.name = name;
        this.color = color;
    }

    static fullUrl = Cypress.config("baseUrl") + "/controls/tags";

    static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != TagCategory.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Controls");
                clickByText(navTab, tags);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected selectColor(color: string): void {
        click(colorMenuToggle);
        clickByText(button, color);
    }

    assertColumnValue(columnName: string, columnVal: string) {
        cy.get(tdTag)
            .contains(this.name)
            .parent(trTag)
            .find(`td[data-label='${columnName}']`)
            .should("contain", columnVal);
    }

    create(cancel = false): void {
        TagCategory.openList();
        clickTags();
        clickByText(button, createTagCategoryButton);
        if (cancel) {
            cancelForm();
        } else {
            fillName(this.name);
            this.selectColor(this.color);
            submitForm();
            closeSuccessAlert();
            selectItemsPerPage(100);
            exists(this.name);
        }
    }

    edit(updatedValue: { name?: string; color?: string }, cancel = false): void {
        TagCategory.openList();
        performRowActionByIcon(this.name, commonView.pencilIcon);
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.color && updatedValue.color != this.color) {
                this.selectColor(updatedValue.color);
                this.color = updatedValue.color;
            }
            if (updatedValue) submitForm();
        }
    }

    delete(cancel = false): void {
        // Opening tags list only if another tab is opened
        TagCategory.openList();
        clickItemInKebabMenu(this.name, deleteAction);
        if (cancel) {
            click(commonView.confirmCancelButton);
        } else {
            confirm();
        }
        cy.wait(SEC);
    }
}
