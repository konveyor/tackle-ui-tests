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
} from "../../../../../utils/utils";
import { Tagtype, Tag } from "../../../../models/controls/tags";

import * as data from "../../../../../utils/data_utils";
import { color, rank, tagCount } from "../../../../types/constants";

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

        // Interceptors
        cy.intercept("POST", "/hub/tag-type*").as("postTagtype");
        cy.intercept("GET", "/hub/tag-type*").as("getTagtypes");
        cy.intercept("PUT", "/hub/tag-type/*").as("putTagtype");
        cy.intercept("DELETE", "/hub/tag-type/*").as("deleteTagtype");
    });

    it("Tag type CRUD", function () {
        selectUserPerspective("Developer");

        // Create new tag type
        const tagtype = new Tagtype(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagtype.create();
        cy.wait("@postTagtype");
        exists(tagtype.name);

        // Edit the tag type name, rank and color
        var updatedTagtype = data.getRandomWord(8);
        var updatedRank = data.getRandomNumber(10, 30);
        var updatedColor = data.getColor();
        tagtype.edit({ name: updatedTagtype, rank: updatedRank, color: updatedColor });
        cy.wait("@putTagtype");
        cy.wait(2000);

        // Assert that tag type name got updated
        exists(updatedTagtype);

        // Assert that rank got updated
        tagtype.assertColumnValue(rank, updatedRank);

        // Assert that color got updated
        tagtype.assertColumnValue(color, updatedColor);

        // Delete tag type
        tagtype.delete();
        cy.wait("@deleteTagtype");
        cy.wait(2000);

        // Assert that tag type got deleted
        notExists(tagtype.name);
    });

    it("Tag type CRUD with member (tags)", function () {
        selectUserPerspective("Developer");

        // Create new tag type
        const tagtype = new Tagtype(
            data.getRandomWord(8),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagtype.create();
        cy.wait("@postTagtype");
        exists(tagtype.name);

        var tagList: Array<Tag> = [];

        // Create multiple tags within the tag type created above
        for (let i = 0; i < 2; i++) {
            const tag = new Tag(data.getRandomWord(6), tagtype.name);
            tag.create();
            tagList.push(tag);
            cy.wait(2000);
        }

        // Assert the current tag count in tag type
        tagtype.assertColumnValue(tagCount, "2");

        // Delete one of the tag
        tagList[1].delete();

        // Assert that tag count got updated for tag type
        tagtype.assertColumnValue(tagCount, "1");

        // Delete tag type
        tagtype.delete();
        cy.wait("@deleteTagtype");
        cy.wait(2000);

        // Assert that tag type got deleted
        notExists(tagtype.name);
    });
});
