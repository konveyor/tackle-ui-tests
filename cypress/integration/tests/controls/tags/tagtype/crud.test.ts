/// <reference types="cypress" />

import { login, exists, notExists } from "../../../../../utils/utils";
import { Tagtype } from "../../../../models/tags";

import { tdTag, trTag } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";

describe("Tag Type CRUD operations", () => {
    beforeEach("Login", function () {
        // Perform login
        login();

        // Interceptors
        cy.intercept("POST", "/api/controls/tag-type*").as("postTagtype");
        cy.intercept("GET", "/api/controls/tag-type*").as("getTagtypes");
        cy.intercept("PUT", "/api/controls/tag-type/*").as("putTagtype");
        cy.intercept("DELETE", "/api/controls/tag-type/*").as("deleteTagtype");
    });

    it("Tag type CRUD", function () {
        // Create new tag type
        const tagtype = new Tagtype(
            data.getRandomWord(5),
            data.getColor(),
            data.getRandomNumber(1, 30)
        );
        tagtype.create();
        cy.wait("@postTagtype");
        exists(tagtype.name);

        // Edit the tag type name, rank and color
        var updatedTagtype = data.getRandomWord(5);
        var updatedRank = data.getRandomNumber(10, 30);
        var updatedColor = data.getColor();
        tagtype.edit({ name: updatedTagtype, rank: updatedRank, color: updatedColor });
        cy.wait("@putTagtype");
        cy.wait("@getTagtypes");

        // Assert that tag type name got updated
        exists(updatedTagtype);

        // Assert that rank got updated
        cy.get(tdTag)
            .contains(updatedTagtype)
            .parent(trTag)
            .find("td[data-label='Rank']")
            .should("contain", updatedRank);

        // Assert that color got updated
        cy.get(tdTag)
            .contains(updatedTagtype)
            .parent(trTag)
            .find("td[data-label='Color']")
            .should("contain", updatedColor);

        // Delete tag type
        tagtype.delete();
        cy.wait("@deleteTagtype");
        cy.wait("@getTagtypes");

        // Assert that tag type got deleted
        notExists(tagtype.name);
    });
});
