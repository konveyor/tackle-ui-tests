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
    button,
    controls,
    deleteAction,
    migration,
    SEC,
    tags,
    tdTag,
    trTag,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";

import {
    applyAction,
    cancelForm,
    click,
    clickByText,
    closeRowDetails,
    confirm,
    expandRowDetails,
    inputText,
    performRowActionByIcon,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import * as commonView from "../../../views/common.view";
import {
    createTagButton,
    dropdownMenuToggle,
    nameInput,
    tagMenuButton,
} from "../../../views/tags.view";

export function clickTags(): void {
    clickByText(navMenu, controls);
    clickByText(navTab, tags);
}

export function fillName(name: string): void {
    inputText(nameInput, name);
}

export class Tag {
    name: string;
    tagCategory: string;

    constructor(name: string, tagCategory: string) {
        this.name = name;
        this.tagCategory = tagCategory;
    }

    static fullUrl = Cypress.env("tackleUrl") + "/controls/tags";

    static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != Tag.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Controls");
                clickByText(navTab, tags);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected selectTagCategory(tagCategory: string): void {
        click(dropdownMenuToggle);
        clickByText(button, tagCategory);
    }

    protected clickTagAction(buttonName: string): void {
        // Performs action (edit and delete only) by clicking tag options menu for a specific tag
        cy.contains(tdTag, this.tagCategory)
            .closest(trTag)
            .next()
            .find(tdTag)
            .contains(this.name)
            .closest(trTag)
            .find(tagMenuButton)
            .click()
            .next()
            .contains(button, buttonName)
            .click();
    }

    create(cancel = false): void {
        Tag.openList();
        clickByText(button, createTagButton);
        if (cancel) {
            cancelForm();
        } else {
            fillName(this.name);
            this.selectTagCategory(this.tagCategory);
            submitForm();
        }
    }

    edit(updatedValue: { name?: string; tagcategory?: string }, cancel = false): void {
        Tag.openList();
        expandRowDetails(this.tagCategory);
        performRowActionByIcon(this.name, commonView.pencilIcon);
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.tagcategory && updatedValue.tagcategory != this.tagCategory) {
                this.selectTagCategory(updatedValue.tagcategory);
                this.tagCategory = updatedValue.tagcategory;
            }
            if (updatedValue) submitForm();
        }
        closeRowDetails(this.tagCategory);
    }

    delete(cancel = false): void {
        Tag.openList();
        expandRowDetails(this.tagCategory);
        applyAction(this.name, deleteAction);
        if (cancel) {
            click(commonView.confirmCancelButton);
        } else {
            confirm();
        }
        cy.wait(SEC);
    }
}
