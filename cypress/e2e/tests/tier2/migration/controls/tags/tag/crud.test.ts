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
    closeRowDetails,
    exists,
    existsWithinRow,
    expandRowDetails,
    notExistsWithinRow,
} from "../../../../../../utils/utils";
import { Tag } from "../../../../../models/migration/controls/tags";

import * as data from "../../../../../../utils/data_utils";
import { tdTag } from "../../../../../types/constants";

describe(["@tier2"], "Tag CRUD operations", () => {
    beforeEach("Login", function () {
        cy.intercept("POST", "/hub/tag*").as("postTag");
        cy.intercept("GET", "/hub/tag*").as("getTag");
        cy.intercept("PUT", "/hub/tag/*").as("putTag");
        cy.intercept("DELETE", "/hub/tag/*").as("deleteTag");
    });

    it("Tag CRUD", function () {
        const tag = new Tag(data.getRandomWord(8), data.getRandomDefaultTagCategory());
        tag.create();
        cy.wait("@postTag");
        expandRowDetails(tag.tagCategory);
        existsWithinRow(tag.tagCategory, tdTag, tag.name);
        closeRowDetails(tag.tagCategory);

        let updatedTagName = data.getRandomWord(8);
        let updatedTagCategoryName = data.getRandomDefaultTagCategory();
        tag.edit({ name: updatedTagName, tagcategory: updatedTagCategoryName });
        cy.get("@putTag");
        exists(updatedTagCategoryName);
        expandRowDetails(updatedTagCategoryName);
        existsWithinRow(updatedTagCategoryName, tdTag, updatedTagName);
        closeRowDetails(updatedTagCategoryName);

        tag.delete();
        cy.get("@deleteTag");
        expandRowDetails(tag.tagCategory);
        notExistsWithinRow(tag.tagCategory, tdTag, tag.name);
        closeRowDetails(tag.tagCategory);
    });
});
