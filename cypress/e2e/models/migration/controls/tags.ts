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
    tags,
    tdTag,
    trTag,
    button,
    SEC,
    editAction,
    deleteAction,
    migration,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";

import {
    clickByText,
    inputText,
    selectItemsPerPage,
    submitForm,
    cancelForm,
    checkSuccessAlert,
    expandRowDetails,
    closeRowDetails,
    selectWithinModal,
    selectUserPerspective,
    applyAction,
    confirm,
    selectFilter,
    click,
    selectCheckBox,
} from "../../../../utils/utils";
import * as commonView from "../../../views/common.view";
import {
    dropdownMenuToggle,
    createTagButton,
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

    constructor(name: string, tagType: string) {
        this.name = name;
        this.tagCategory = tagType;
    }

    static fullUrl = Cypress.env("tackleUrl") + "/controls/tags";

    static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != Tag.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                clickByText(navTab, tags);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected selectTagType(tagType: string): void {
        click(dropdownMenuToggle);
        clickByText(button, tagType);
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
            this.selectTagType(this.tagCategory);
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                "Success alert:Tag was successfully created."
            );
        }
    }

    edit(updatedValue: { name?: string; tagtype?: string }, cancel = false): void {
        Tag.openList();
        expandRowDetails(this.tagCategory);
        this.clickTagAction(editAction);
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.tagtype && updatedValue.tagtype != this.tagCategory) {
                this.selectTagType(updatedValue.tagtype);
                this.tagCategory = updatedValue.tagtype;
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
            cancelForm();
        } else {
            confirm();
        }
        cy.wait(SEC);
    }
}
