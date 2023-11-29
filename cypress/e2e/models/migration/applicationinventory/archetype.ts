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
    clickByText,
    cancelForm,
    inputText,
    selectFormItems,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import { migration } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";
import * as archetype from "../../../views/archetype.view";

export interface Archetype {
    name: string;
    criteriaTags: string[];
    archetypeTags: string[];
    description?: string;
    stakeholders?: Stakeholders[];
    stakeholderGroups?: Stakeholdergroups[];
    comment?: string;
}

export class Archetype {
    constructor(
        name: string,
        criteriaTags: string[],
        archetypeTags: string[],
        description?: string,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[],
        comment?: string
    ) {
        this.name = name;
        this.criteriaTags = criteriaTags;
        this.archetypeTags = archetypeTags;
        this.description = description;
        this.stakeholders = stakeholders;
        this.stakeholderGroups = stakeholderGroups;
        this.comment = comment;
    }

    static fullUrl = Cypress.env("tackleUrl") + "/archetypes";

    public static open(forceReload = false) {
        if (forceReload) {
            cy.visit(Archetype.fullUrl);
        }
        cy.url().then(($url) => {
            if ($url != Archetype.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, "Archetypes");
                selectItemsPerPage(100);
            }
        });
    }

    protected fillName(name: string): void {
        inputText(archetype.name, name);
    }

    protected selectCriteriaTags(tags: string[]): void {
        tags.forEach(function (tag) {
            selectFormItems(archetype.criteriaTags, tag);
        });
    }

    protected selectArchetypeTags(tags: string[]): void {
        tags.forEach(function (tag) {
            selectFormItems(archetype.archetypeTags, tag);
        });
    }

    protected fillDescription(description: string): void {
        inputText(archetype.description, description);
    }

    protected selectStakeholders(stakeholders: Stakeholders[]) {
        stakeholders.forEach((stakeholder) => {
            inputText(archetype.stakeholders, stakeholder.name);
            cy.get("button").contains(stakeholder.name).click();
        });
    }

    protected selectStakeholderGroups(stakeholderGroups: Stakeholdergroups[]) {
        stakeholderGroups.forEach((stakeholderGroup) => {
            inputText(archetype.stakeholderGroups, stakeholderGroup.name);
            cy.get("button").contains(stakeholderGroup.name).click();
        });
    }

    /*
    protected selectStakeholderGroups(stakeholderGroup: string) {
        inputText(archetype.stakeholderGroups, stakeholderGroup);
        cy.get("button").contains(stakeholderGroup).click();
    }*/

    protected fillComment(comment: string): void {
        inputText(archetype.comments, comment);
    }

    create(cancel = false): void {
        Archetype.open();
        cy.contains("button", "Create new archetype", { timeout: 20000 })
            .should("be.enabled")
            .click();
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.selectCriteriaTags(this.criteriaTags);
            this.selectArchetypeTags(this.archetypeTags);
            if (this.description) this.fillDescription(this.description);
            if (this.stakeholders) this.selectStakeholders(this.stakeholders);
            if (this.stakeholderGroups) this.selectStakeholderGroups(this.stakeholderGroups);
        }
        if (this.comment) this.fillComment(this.comment);
        submitForm();
    }
}
