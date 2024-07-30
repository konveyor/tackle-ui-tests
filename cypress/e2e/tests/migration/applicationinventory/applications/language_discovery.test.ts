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
    deleteByList,
    getRandomApplicationData,
    sidedrawerTab,
} from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { SEC } from "../../../../types/constants";
import { labelTagText } from "../../../../views/applicationinventory.view";

let applicationList: Application[];

describe(["@tier2"], "Test if application language discovered and tagged correctly", () => {
    before("Login", function () {
        login();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        applicationList = [];
    });

    it("Application written in java with maven tooling and quarkus framework", function () {
        // Automates Polarion MTA-586

        const sectionsTags = {
            Language: ["Java"],
            Tooling: ["Maven"],
            Framework: ["Quarkus"],
        };

        const application = new Application(
            getRandomApplicationData("Java_language_maven_tooling_quarkus_framework", {
                sourceData: this.appData["Java_language_maven_tooling_quarkus_framework"],
            })
        );

        applicationList.push(application);
        application.create();

        cy.wait(2 * SEC);

        sidedrawerTab("Java_language_maven_tooling_quarkus_framework", "Tags");

        cy.contains("No tags available", { timeout: 60 * SEC }).should("not.exist");

        assertTagsInSection(sectionsTags);
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationList);
    });

    function assertTagsInSection(sectionsTags): void {
        Cypress._.forEach(sectionsTags, (tags, section) => {
            cy.contains("h4", section)
                .parentsUntil("section")
                .next()
                .within(() => {
                    tags.forEach((tag) => {
                        cy.contains(labelTagText, tag).should("have.length", 1);
                        cy.log(`Found ${tag} in the ${section} section`);
                    });
                });
        });
    }
});
