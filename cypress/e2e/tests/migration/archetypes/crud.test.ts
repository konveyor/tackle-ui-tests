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
import { successAlertMessage } from "../../../views/common.view";
import * as data from "../../../../utils/data_utils";
import { SEC } from "../../../types/constants";
import { getRandomWord } from "../../../../utils/data_utils";

let stakeholders: Stakeholders[];
let stakeholderGroups: Stakeholdergroups[];
let tags: Tag[];

describe(["@tier1"], "Archetype CRUD operations", () => {
    before("Login", function () {
        login();
        stakeholders = createMultipleStakeholders(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
        tags = createMultipleTags(2);
    });

    it("Archetype CRUD operations", function () {
        // Automates Polarion MTA-395

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

        const updatedArchetypeName = data.getRandomWord(8);
        archetype.edit({ name: updatedArchetypeName });
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype was successfully saved.`,
            true
        );
        exists(updatedArchetypeName);

        archetype.delete();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype ${archetype.name} was successfully deleted.`,
            true
        );
        notExists(archetype.name);
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

        cy.log(`Tags: ${archetype.criteriaTags[0]}`);

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

        archetype.delete();
        archetypeDuplicate.delete();

        notExists(archetype.name);
        notExists(archetypeDuplicate.name);
    });

    it("Discard archetype review", function () {
        // Automates Polarion MTA-428

        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders,
            stakeholderGroups
        );

        cy.log(`Tags: ${archetype.criteriaTags[0]}`);

        archetype.create();
        checkSuccessAlert(
            successAlertMessage,
            `Success alert:Archetype ${archetype.name} was successfully created.`,
            true
        );
        exists(archetype.name);

        archetype.perform_review("high");
        cy.wait(2 * SEC);
        archetype.validateReviewFields();

        archetype.discardReview();
        cy.wait(2 * SEC);
        archetype.validateNotReviewed();
        cy.wait(2 * SEC);
        archetype.delete();
    });

    after("Clear test data", function () {
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
    });
});
