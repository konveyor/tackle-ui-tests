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
    login,
    exists,
    notExists,
    hasToBeSkipped,
    preservecookies,
    selectUserPerspective,
} from "../../../../../../utils/utils";
import { Tag } from "../../../../../models/migration/controls/tags";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";

import * as data from "../../../../../../utils/data_utils";
import { color, migration, rank, tagCategory, tagCount } from "../../../../../types/constants";

describe(["@tier1"], "Tag tagCategory CRUD operations", () => {
    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Tag Category CRUD", function () {
        selectUserPerspective("Migration");

        // Create new tag category
        const tagCategory = new TagCategory(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagCategory.create();
        exists(tagCategory.name);

        // Edit the tag category name, rank and color
        let updatedTagType = data.getRandomWord(8);
        let updatedRank = data.getRandomNumber(10, 30);
        let updatedColor = data.getColor();
        tagCategory.edit({ name: updatedTagType, rank: updatedRank, color: updatedColor });
        cy.wait(2000);

        // Assert that tag category name got updated
        exists(updatedTagType);

        // Assert that rank got updated
        tagCategory.assertColumnValue(rank, updatedRank);

        // Assert that color got updated
        tagCategory.assertColumnValue(color, updatedColor);

        // Delete tag category
        tagCategory.delete();
        cy.wait(2000);

        // Assert that tag category got deleted
        notExists(tagCategory.name);
    });

    it("Tag category CRUD with member (tags)", function () {
        selectUserPerspective(migration);

        // Create new tag category
        const tagCategory = new TagCategory(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagCategory.create();
        exists(tagCategory.name);

        let tagList: Array<Tag> = [];

        // Create multiple tags within the tag category created above
        for (let i = 0; i < 2; i++) {
            const tag = new Tag(data.getRandomWord(6), tagCategory.name);
            tag.create();
            tagList.push(tag);
            cy.wait(2000);
        }

        let tagAmount = tagList.length;
        for (let currentTag of tagList) {
            currentTag.delete();
            tagAmount -= 1;
            tagCategory.assertColumnValue(tagCount, tagAmount.toString());
        }

        // Delete tag category
        tagCategory.delete();
        cy.wait(2000);

        // Assert that tag category got deleted
        notExists(tagCategory.name);
    });
});
