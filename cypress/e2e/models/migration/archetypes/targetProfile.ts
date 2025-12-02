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
    clickItemInKebabMenu,
    inputText,
    selectItemsPerPage,
    submitForm,
} from "../../../../utils/utils";
import { SEC } from "../../../types/constants";
import * as commonView from "../../../views/common.view";

export class targetProfile {
    name: string;
    generatorList: string[];

    constructor(name: string, generatorList: string[]) {
        this.name = name;
        this.generatorList = generatorList;
    }

    static fullUrl = Cypress.config("baseUrl") + "target-profiles";

    public static open(forceReload = false) {
        const itemsPerPage = 100;
        cy.visit(targetProfile.fullUrl, { timeout: 15 * SEC }).then((_) => {
            selectItemsPerPage(itemsPerPage);
        });
    }

    protected fillName(name: string): void {
        inputText(targetProfile.name, name);
    }

    protected selectGenerators(generatorList: string[]): void {
        generatorList.forEach((generator) => {
            cy.get("span.pf-v5-c-dual-list-selector__item-text").contains(generator).click();
        });
        cy.get("div.pf-v5-c-dual-list-selector__controls-item").click();
    }

    create(cancel = false): void {
        cy.contains("button", "Create new target profile", { timeout: 8000 })
            .should("be.visible")
            .and("not.be.disabled")
            .click();
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.selectGenerators(this.generatorList);
            submitForm();
        }
    }

    delete(cancel = false): void {
        clickItemInKebabMenu(this.name, "Delete");
        if (cancel) {
            cancelForm();
        } else click(commonView.confirmButton);
    }
}
