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
    inputText,
    selectFormItems,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import { administration, SEC } from "../../../types/constants";
import * as commonView from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";

export class SourcePlatform {
    constructor(name: string, type: string, url: string, credentials: string) {
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
            if ($url != SourcePlatform.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navMenu, "Source platforms");
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Source platforms");
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected fillName(name: string): void {
        inputText(sourceplatform.name, name);
    }

    protected selectType(type: string[]): void {
        selectFormItems(sourceplatform.name, type);
    }

    protected fillUrl(url: string): void {
        inputText(sourceplatform.url, url);
    }

    protected selectCredentials(credentials: string[]): void {
        selectFormItems(sourceplatform.credentials, credentials);
    }

    create(cancel = false): void {
        SourcePlatform.open();
        cy.contains("button", "Create new platform", { timeout: 20000 })
            .should(($btn) => {
                // Wait until the button is enabled and visible
                expect($btn).to.be.visible;
                expect($btn).not.to.be.disabled;
            })
            .click({ force: true });
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.selectType(this.type);
            this.fillUrl(this.url);
            if (this.credentials) this.selectCredentials(this.credentials);
        }
        submitForm();
    }

    delete(cancel = false): void {
        SourcePlatform.open();
        clickKebabMenuOption(this.name, "Delete");
        if (cancel) {
            cancelForm();
        } else click(commonView.confirmButton);
    }
}
