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
    clickKebabMenuOptionArchetype,
    clickWithinByText,
    inputText,
} from "../../../../utils/utils";
import * as commonView from "../../../views/common.view";
import * as view from "../../../views/target-profile.view";
import { Archetype } from "./archetype";

export class TargetProfile {
    name: string;
    generatorList: string[];

    constructor(name: string, generatorList: string[]) {
        this.name = name;
        this.generatorList = generatorList;
    }

    open(archetypeName: string) {
        Archetype.open();
        clickKebabMenuOptionArchetype(archetypeName, "Manage target profiles");
    }

    protected fillName(name: string): void {
        inputText("#target-profile-name", name);
    }

    protected selectGenerators(generatorList: string[]): void {
        generatorList.forEach((generator) => {
            cy.contains(view.generatorListItem, generator).should("exist").click({ force: true });
        });
        cy.get(view.addSelectedItems).click();
    }

    create(archetypeName: string, cancel = false): void {
        this.open(archetypeName);
        cy.contains("button", "Create new target profile")
            .should("be.visible")
            .and("not.be.disabled")
            .click();

        if (cancel) {
            cancelForm();
            return;
        }

        this.fillName(this.name);
        this.selectGenerators(this.generatorList);
        clickWithinByText(commonView.modal, "button", "Create");
    }

    delete(cancel = false): void {
        clickItemInKebabMenu(this.name, "Delete");
        if (cancel) {
            cancelForm();
            return;
        }
        click(commonView.confirmButton);
    }
}
