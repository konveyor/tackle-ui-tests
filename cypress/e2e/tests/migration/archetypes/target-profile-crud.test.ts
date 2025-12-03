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

import { TargetProfile } from "../../../../e2e/models/migration/archetypes/targetProfile";
import { getRandomWord } from "../../../../utils/data_utils";
import {
    createMultipleTags,
    deleteByList,
    exists,
    login,
    notExists,
} from "../../../../utils/utils";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Tag } from "../../../models/migration/controls/tags";
import { defaultGenerator, SEC } from "../../../types/constants";
import { successAlertMessage } from "../../../views/common.view";

let tags: Tag[];
let archetype: Archetype;

describe(["@tier3"], "CRUD operations on Archetype target profile ", () => {
    before("Login", function () {
        login();
        cy.visit("/");

        tags = createMultipleTags(2);

        archetype = new Archetype(`test-arch-${getRandomWord(8)}`, [tags[0].name], [tags[1].name]);
        archetype.create();
    });

    it("Perform CRUD tests on Archetype target profile", function () {
        // Automates Polarion MTA-786
        const targetProf = new TargetProfile(`test-profile-${getRandomWord(8)}`, [
            defaultGenerator,
        ]);
        targetProf.create(archetype.name);
        cy.get(successAlertMessage, { timeout: 150 * SEC })
            .eq(1)
            .should("contain.text", `Success alert:Archetype was successfully saved.`);
        exists(targetProf.name);

        targetProf.delete();
        cy.get(successAlertMessage, { timeout: 150 * SEC })
            .eq(1)
            .should("contain.text", `Success alert:Archetype was successfully saved.`);
        notExists(targetProf.name);
    });

    after("Clear test data", function () {
        archetype.delete();
        deleteByList(tags);
    });
});
