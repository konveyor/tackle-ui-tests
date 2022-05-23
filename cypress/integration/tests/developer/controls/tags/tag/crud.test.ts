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
    expandRowDetails,
    existsWithinRow,
    closeRowDetails,
    notExistsWithinRow,
    hasToBeSkipped,
    selectUserPerspective,
} from "../../../../../utils/utils";
import { Tag } from "../../../../models/controls/tags";

import { tdTag } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";

describe("Tag CRUD operations", { tags: "@tier1" }, () => {
    beforeEach("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/hub/tag*").as("postTag");
        cy.intercept("GET", "/hub/tag*").as("getTag");
        cy.intercept("PUT", "/hub/tag/*").as("putTag");
        cy.intercept("DELETE", "/hub/tag/*").as("deleteTag");
    });

    it("Tag CRUD", function () {
        selectUserPerspective("Developer");
        // Create new tag
        const tag = new Tag(data.getRandomWord(8), data.getExistingTagtype());
        tag.create();
        cy.wait("@postTag");

        // Assert that created tag exists
        expandRowDetails(tag.tagtype);
        existsWithinRow(tag.tagtype, tdTag, tag.name);
        closeRowDetails(tag.tagtype);

        // Edit the tag and tag type name
        var updatedTagName = data.getRandomWord(8);
        var updatedTagtypeName = data.getExistingTagtype();
        tag.edit({ name: updatedTagName, tagtype: updatedTagtypeName });
        cy.wait("@putTag");
        cy.wait(2000);

        // Assert that tag type name got updated
        exists(updatedTagtypeName);

        // Assert that tag name got updated
        expandRowDetails(updatedTagtypeName);
        existsWithinRow(updatedTagtypeName, tdTag, updatedTagName);
        closeRowDetails(updatedTagtypeName);

        // Delete tag
        tag.delete();
        cy.wait("@deleteTag");
        cy.wait(2000);

        // Assert that tag got deleted
        expandRowDetails(tag.tagtype);
        notExistsWithinRow(tag.tagtype, tdTag, tag.name);
        closeRowDetails(tag.tagtype);
    });
});
