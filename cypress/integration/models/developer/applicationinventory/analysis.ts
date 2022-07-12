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
    applicationInventory,
    tdTag,
    trTag,
    button,
    analyze,
    analysis,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    applicationNameInput,
    applicationDescriptionInput,
    selectBox,
} from "../../../views/applicationinventory.view";
import {
    clickByText,
    inputText,
    click,
    cancelForm,
    selectFormItems,
    selectUserPerspective,
} from "../../../../utils/utils";


export class Analysis {
    name: string;
    business: string;
    description: string;
    tags: Array<string>;
    comment: string;

    constructor(
        name: string,
        business: string,
        description?: string,
        comment?: string,
        tags?: Array<string>
    ) {
        this.name = name;
        this.business = business;
        if (description) this.description = description;
        if (comment) this.comment = comment;
        if (tags) this.tags = tags;
    }
    public static Open(): void {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, analysis);
    }

    protected fillName(name: string): void {
        inputText(applicationNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(applicationDescriptionInput, description);
    }

    selectApplication(): void {
        cy.wait(4000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(selectBox);
                cy.wait(2000);
            });
    } 

    analyze(cancel = false): void {
        Analysis.Open();
        this.selectApplication();
        clickByText(button, analyze);
        if (cancel) {
            cancelForm();
        } else {
            //select type
        }
    }
}
