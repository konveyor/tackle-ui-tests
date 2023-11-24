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
import { clickByText, selectItemsPerPage, selectUserPerspective } from "../../../../utils/utils";
import { migration } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";

export interface Archetype {
    name: string;
    criteriaTags: Array<string>;
    archetypeTags: Array<string>;
    description?: string;
    stakeholders?: Stakeholders[];
    stakeholderGroups?: Stakeholdergroups[];
    comment?: string;
}

export class Archetype {
    constructor(
        name: string,
        criteriaTags: Array<string>,
        archetypeTags: Array<string>,
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
}
