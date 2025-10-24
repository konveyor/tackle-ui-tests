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
    selectFormItems,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import { administration, SEC } from "../../../types/constants";
import * as commonView from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";
import * as sourcePlatform from "../../../views/source-platform.view";

export class SourcePlatform {
    name: string;
    type: string;
    url: string;
    credentials?: string;

    constructor(name: string, type: string, url: string, credentials?: string) {
        this.name = name;
        this.type = type;
        this.url = url;
        this.credentials = credentials;
    }

    static fullUrl = Cypress.config("baseUrl") + "/source-platforms";

    public static open(forceReload = false) {
        const itemsPerPage = 100;
        if (forceReload) {
            cy.visit(SourcePlatform.fullUrl, { timeout: 15 * SEC }).then((_) => {
                cy.get("h1", { timeout: 35 * SEC }).should("contain", "Source platforms");
                selectItemsPerPage(itemsPerPage);
            });
            return;
        }

        cy.url().then(($url) => {
            if ($url !== SourcePlatform.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navMenu, "Source platforms");
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Source platforms");
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected fillName(name: string): void {
        inputText(sourcePlatform.name, name);
    }

    protected selectType(type: string): void {
        selectFormItems(sourcePlatform.type, type);
    }

    protected fillUrl(url: string): void {
        inputText(sourcePlatform.url, url);
    }

    protected selectCredentials(credentials: string): void {
        selectFormItems(sourcePlatform.credentials, credentials);
    }

    create(cancel = false): void {
        SourcePlatform.open();
        cy.contains("button", "Create new platform", { timeout: 20000 })
            .should("be.visible")
            .and("not.be.disabled")
            .click({ force: true });
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.selectType(this.type);
            this.fillUrl(this.url);
            if (this.credentials) this.selectCredentials(this.credentials);
            submitForm();
        }
    }

    // TODO: Add update method and corresponding test
    delete(cancel = false): void {
        SourcePlatform.open();
        clickItemInKebabMenu(this.name, "Delete");
        if (cancel) {
            cancelForm();
        } else click(commonView.confirmButton);
    }

    edit(
        updatedValues: {
            name?: string;
            url?: string;
            credentials?: string;
        },
        cancel = false
    ): void {
        SourcePlatform.open();
        performRowActionByIcon(this.name, commonView.pencilAction);

        if (cancel) {
            cancelForm();
        } else {
            if (updatedValues.name && updatedValues.name !== this.name) {
                this.fillName(updatedValues.name);
                this.name = updatedValues.name;
            }
            if (updatedValues.url && updatedValues.url !== this.url) {
                this.fillUrl(updatedValues.url);
                this.url = updatedValues.url;
            }
            if (updatedValues.credentials && updatedValues.credentials !== this.credentials) {
                this.selectCredentials(updatedValues.credentials);
                this.credentials = updatedValues.credentials;
            }
            if (updatedValues) {
                submitForm();
            }
        }
    }
}
