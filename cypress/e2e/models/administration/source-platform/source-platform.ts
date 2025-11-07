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
    next,
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
        cy.contains("button", "Create new platform", { timeout: 8000 })
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

    delete(cancel = false): void {
        SourcePlatform.open();
        clickItemInKebabMenu(this.name, "Delete");
        if (cancel) {
            cancelForm();
        } else click(commonView.confirmButton);
    }

    edit(
        updatedValues: Partial<{
            name: string;
            url: string;
            credentials: string;
        }>,
        cancel = false
    ): void {
        SourcePlatform.open();
        performRowActionByIcon(this.name, commonView.pencilAction);

        if (cancel) {
            cancelForm();
            return;
        }

        const { name, url, credentials } = updatedValues;

        if (name && name !== this.name) {
            this.fillName(name);
            this.name = name;
        }

        if (url && url !== this.url) {
            this.fillUrl(url);
            this.url = url;
        }

        if (credentials && credentials !== this.credentials) {
            this.selectCredentials(credentials);
            this.credentials = credentials;
        }

        if (Object.keys(updatedValues).length > 0) {
            submitForm();
        }
    }

    discover(cancel = false): void {
        SourcePlatform.open();
        clickItemInKebabMenu(this.name, "Discover applications");
        if (cancel) {
            cancelForm();
        } else {
            // Enter app name
            cy.contains("Add a name").click();
            inputText('input[name="names.0.value"]', "hello-spring-cloud");

            cy.contains("Add a space").click();
            inputText('input[name="spaces.0.value"]', "space");
            next();
            cy.contains("button", "Discover applications").click();
            cy.contains("Close").click();
            cy.get("span.pf-v5-c-icon__content pf-m-success", { timeout: 20000 });
        }
    }
}
