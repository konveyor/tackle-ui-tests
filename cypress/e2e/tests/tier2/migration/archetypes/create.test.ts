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
/// <reference types="cypress" />

import * as data from "../../../../utils/data_utils";
import { getRandomWord } from "../../../../utils/data_utils";
import {
    checkSuccessAlert,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    exists,
    login,
    notExists,
} from "../../../../utils/utils";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Stakeholdergroups } from "../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Tag } from "../../../models/migration/controls/tags";
import { archetypeTags, criteriaTags } from "../../../views/archetype.view";
import { successAlertMessage } from "../../../views/common.view";

let stakeholders: Stakeholders[];
let stakeholderGroups: Stakeholdergroups[];
let tags: Tag[];

describe(["@tier2"], "Archetype CRUD operations", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        stakeholders = createMultipleStakeholders(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
        tags = createMultipleTags(2);
    });

    it("Duplicate archetype", function () {
        // Automates Polarion MTA-399

        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders,
            stakeholderGroups
        );

        archetype.create();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype ${archetype.name} was successfully created.`,
            true
        );
        exists(archetype.name);

        const archetypeDuplicate = archetype.duplicate(getRandomWord(6));
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype ${archetypeDuplicate.name} was successfully created.`,
            true
        );
        exists(archetypeDuplicate.name);

        archetypeDuplicate.assertsTagsMatch(archetypeTags, archetype.archetypeTags, true, false);
        archetypeDuplicate.assertsTagsMatch(criteriaTags, archetype.criteriaTags, false, true);

        archetype.delete();
        archetypeDuplicate.delete();

        notExists(archetype.name);
        notExists(archetypeDuplicate.name);
    });

    after("Clear test data", function () {
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
    });
});
