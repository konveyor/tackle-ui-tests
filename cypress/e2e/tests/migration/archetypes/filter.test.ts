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
    applySearchFilter,
    clickByText,
    createMultipleArchetypes,
    deleteByList,
    exists,
    login,
    notExists,
} from "../../../../utils/utils";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { button, clearAllFilters, name } from "../../../types/constants";

let archetypeList: Archetype[];

describe(["@tier3"], "Archetype filter validation", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        archetypeList = createMultipleArchetypes(2);
    });

    it("Name filter validation", function () {
        // Automates Polarion MTA-412

        Archetype.open();

        let searchInput = archetypeList[0].name;

        applySearchFilter(name, searchInput);
        exists(archetypeList[0].name);
        notExists(archetypeList[1].name);
        clickByText(button, clearAllFilters);

        searchInput = archetypeList[1].name;

        applySearchFilter(name, searchInput);
        exists(archetypeList[1].name);
        notExists(archetypeList[0].name);
        clickByText(button, clearAllFilters);
    });

    after("Perform test data clean up", function () {
        deleteByList(archetypeList);
    });
});
