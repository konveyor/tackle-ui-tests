/// <reference types="cypress" />

import {
    login,
    exists,
    expandRowDetails,
    existsWithinRow,
    closeRowDetails,
    notExistsWithinRow,
} from "../../../../../utils/utils";
import { Tag } from "../../../../models/tags";

import { tdTag } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";

describe("Tag CRUD operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/tag*").as("postTag");
        cy.intercept("GET", "/api/controls/tag*").as("getTag");
        cy.intercept("PUT", "/api/controls/tag/*").as("putTag");
        cy.intercept("DELETE", "/api/controls/tag/*").as("deleteTag");
    });

    it("Tag CRUD", function () {
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
