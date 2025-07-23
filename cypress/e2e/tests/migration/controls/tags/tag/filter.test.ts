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

import * as data from "../../../../../../utils/data_utils";
import {
    applySelectFilter,
    clearAllFilters,
    closeRowDetails,
    exists,
    existsWithinRow,
    expandRowDetails,
    login,
} from "../../../../../../utils/utils";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";
import { Tag } from "../../../../../models/migration/controls/tags";
import { name, tdTag } from "../../../../../types/constants";

describe(["@tier3"], "Tags filter validations", function () {
    const tagCategory = new TagCategory(data.getRandomWord(5), data.getColor());
    const tag = new Tag(data.getRandomWord(5), tagCategory.name);

    before("Login", function () {
        login();
        cy.visit("/");
        tagCategory.create();
        tag.create();
    });

    it("Name filter validations", function () {
        let validSearchInputTag = tag.name.substring(0, 3);
        let validSearchInputTagCategory = tagCategory.name.substring(0, 3);
        let filterType = name;

        Tag.openList();
        applySelectFilter("tags", filterType, validSearchInputTag);
        expandRowDetails(tag.tagCategory);
        existsWithinRow(tag.tagCategory, tdTag, tag.name);
        closeRowDetails(tag.tagCategory);

        applySelectFilter("tags", filterType, validSearchInputTagCategory);
        exists(validSearchInputTagCategory);

        clearAllFilters();

        // Enter a non-existing tag name substring and apply it as search filter
        let invalidSearchInput = String(data.getRandomNumber(111111, 222222));
        applySelectFilter("tags", filterType, invalidSearchInput, false);
    });

    after("Cleanup", function () {
        tag.delete();
        tagCategory.delete();
    });
});
