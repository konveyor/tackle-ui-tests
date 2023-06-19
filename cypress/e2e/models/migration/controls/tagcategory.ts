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
    checkSuccessAlert,
    click,
    clickByText,
    confirm,
    inputText,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { button, controls, migration, SEC, tags, tdTag, trTag } from "../../../types/constants";
import { createTagCategoryButton, rankInput } from "../../../views/tags.view";
import * as commonView from "../../../views/common.view";
import { clickTags, fillName } from "./tags";

export class TagCategory {
    name: string;
    rank: number;
    fieldId: "color";
    color: string;

    constructor(name: string, color: string, rank?: number) {
        this.name = name;
        this.color = color;
        if (rank) this.rank = rank;
    }

    static fullUrl = Cypress.env("tackleUrl") + "/controls/tags";

    static openList(itemsPerPage = 100): void {
        cy.url().then(($url) => {
            if ($url != TagCategory.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, controls);
                clickByText(navTab, tags);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected selectColor(color: string): void {
        cy.waitForReact();
        cy.react("FormGroup", { props: { fieldId: "color" } }).click();
        clickByText(button, color);
    }

    protected fillRank(rank: number): void {
        inputText(rankInput, rank);
    }

    assertColumnValue(columnName, columnVal) {
        cy.get(tdTag)
            .contains(this.name)
            .parent(trTag)
            .find(`td[data-label='${columnName}']`)
            .should("contain", columnVal);
    }

    create(cancel = false): void {
        clickTags();
        clickByText(button, createTagCategoryButton);
        if (cancel) {
            cancelForm();
        } else {
            fillName(this.name);
            this.selectColor(this.color);
            if (this.rank) this.fillRank(this.rank);
            submitForm();
            checkSuccessAlert(
                commonView.successAlertMessage,
                "Success alert:Tag category was successfully created."
            );
        }
    }

    edit(updatedValue: { name?: string; rank?: number; color?: string }, cancel = false): void {
        TagCategory.openList();
        cy.get(tdTag)
            .contains(this.name)
            .parent(trTag)
            .within(() => {
                click(commonView.editButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            if (updatedValue.name && updatedValue.name != this.name) {
                fillName(updatedValue.name);
                this.name = updatedValue.name;
            }
            if (updatedValue.rank && updatedValue.rank != this.rank) {
                this.fillRank(updatedValue.rank);
                this.rank = updatedValue.rank;
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
        cy.get(tdTag, { timeout: 2 * SEC })
            .contains(this.name)
            .parent(trTag)
            .within(() => {
                click(commonView.deleteButton);
            });
        if (cancel) {
            cancelForm();
        } else {
            confirm();
        }
        cy.wait(SEC);
    }
}
