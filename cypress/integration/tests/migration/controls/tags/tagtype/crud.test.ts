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
import { TagType } from "../../../../../models/migration/controls/tagtypes";

import * as data from "../../../../../../utils/data_utils";
import { color, migration, rank, tagCount } from "../../../../../types/constants";

describe("Tag Type CRUD operations", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Tag type CRUD", function () {
        selectUserPerspective("Migration");

        // Create new tag type
        const tagType = new TagType(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagType.create();
        exists(tagType.name);

        // Edit the tag type name, rank and color
        let updatedTagType = data.getRandomWord(8);
        let updatedRank = data.getRandomNumber(10, 30);
        let updatedColor = data.getColor();
        tagType.edit({ name: updatedTagType, rank: updatedRank, color: updatedColor });
        cy.wait(2000);

        // Assert that tag type name got updated
        exists(updatedTagType);

        // Assert that rank got updated
        tagType.assertColumnValue(rank, updatedRank);

        // Assert that color got updated
        tagType.assertColumnValue(color, updatedColor);

        // Delete tag type
        tagType.delete();
        cy.wait(2000);

        // Assert that tag type got deleted
        notExists(tagType.name);
    });

    it("Tag type CRUD with member (tags)", function () {
        selectUserPerspective(migration);

        // Create new tag type
        const tagType = new TagType(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagType.create();
        exists(tagType.name);

        let tagList: Array<Tag> = [];

        // Create multiple tags within the tag type created above
        for (let i = 0; i < 2; i++) {
            const tag = new Tag(data.getRandomWord(6), tagType.name);
            tag.create();
            tagList.push(tag);
            cy.wait(2000);
        }

        let tagAmount = tagList.length;
        for (let currentTag of tagList) {
            currentTag.delete();
            tagAmount -= 1;
            tagType.assertColumnValue(tagCount, tagAmount.toString());
        }

        // Delete tag type
        tagType.delete();
        cy.wait(2000);

        // Assert that tag type got deleted
        notExists(tagType.name);
    });
});
