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

import { exists, notExists } from "../../../../../../utils/utils";
import { TagCategory } from "../../../../../models/migration/controls/tagcategory";
import { Tag } from "../../../../../models/migration/controls/tags";

import * as data from "../../../../../../utils/data_utils";
import { color, tagCount } from "../../../../../types/constants";

describe(["@tier2"], "Tag tagCategory CRUD operations", () => {
    it("Tag Category CRUD", function () {
        const tagCategory = new TagCategory(data.getRandomWord(8), data.getColor());
        tagCategory.create();
        exists(tagCategory.name);

        let updatedTagType = data.getRandomWord(8);
        let updatedColor = data.getColor();
        tagCategory.edit({ name: updatedTagType, color: updatedColor });
        exists(updatedTagType);

        tagCategory.assertColumnValue(color, updatedColor);
        tagCategory.delete();
        notExists(tagCategory.name);
    });

    it("Tag category CRUD with member (tags)", function () {
        const tagCategory = new TagCategory(data.getRandomWord(8), data.getColor());
        tagCategory.create();
        exists(tagCategory.name);

        let tagList: Array<Tag> = [];
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

        tagCategory.delete();
        notExists(tagCategory.name);
    });
});
