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
    developer,
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
    tagTypeToggle,
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
    tagType: string;

    constructor(name: string, tagType: string) {
        this.name = name;
        this.tagType = tagType;
    }

    static fullUrl = Cypress.env("tackleUrl") + "/controls/tags";

    static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != Tag.fullUrl) {
                selectUserPerspective(developer);
                clickByText(navMenu, controls);
                clickByText(navTab, tags);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected selectTagType(tagType: string): void {
        click(tagTypeToggle);
        clickByText(button, tagType);
    }

    protected clickTagAction(buttonName: string): void {
        // Performs action (edit and delete only) by clicking tag options menu for a specific tag
        cy.contains(tdTag, this.tagType)
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
            this.selectTagType(this.tagType);
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! ${this.name} was added as a(n) tag.`
            );
        }
    }

    edit(updatedValue: { name?: string; tagtype?: string }, cancel = false): void {
        Tag.openList();
        expandRowDetails(this.tagType);
        this.clickTagAction(editAction);
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.tagtype && updatedValue.tagtype != this.tagType) {
                this.selectTagType(updatedValue.tagtype);
                this.tagType = updatedValue.tagtype;
            }
            if (updatedValue) submitForm();
        }
        closeRowDetails(this.tagType);
    }

    delete(cancel = false): void {
        Tag.openList();
        expandRowDetails(this.tagType);
        applyAction(this.name, deleteAction);
        if (cancel) {
            cancelForm();
        } else {
            confirm();
        }
        cy.wait(SEC);
    }
}
