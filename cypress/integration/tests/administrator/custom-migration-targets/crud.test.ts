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

import { login, hasToBeSkipped } from "../../../../utils/utils";
import { SEC } from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { CustomMigrationTarget } from "../../../models/administrator/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";

describe("Custom Migration Targets CRUD operations", { tags: "@tier1" }, () => {
    beforeEach("Login", function () {
        if (hasToBeSkipped("@tier1")) return;

        login();

        cy.intercept("POST", "/hub/rulebundles*").as("postRule");
        cy.intercept("GET", "/hub/rulebundles*").as("getRule");
        cy.intercept("PUT", "/hub/rulebundles*/*").as("putRule");
        cy.intercept("DELETE", "/hub/rulebundles*/*").as("deleteRule");
    });

    it("Custom Migration Targets CRUD", function () {
        CustomMigrationTarget.open();
        const target = new CustomMigrationTarget(
            data.getRandomWord(8),
            data.getDescription(),
            "img/cloud.png",
            "xml/javax-package-custom-target.windup.xml"
        );
        target.create();
        cy.wait("@postRule");
        cy.contains(CustomMigrationTargetView.takeMeThereNotification).click();
        cy.get("article", { timeout: 12 * SEC }).should("contain", target.name);

        const newName = data.getRandomWord(8);
        target.edit({
            name: newName,
            rulesetPath: "xml/javax-package-custom.windup.xml",
        });
        cy.wait("@putRule");
        cy.get("article", { timeout: 12 * SEC }).should("contain", newName);
        target.name = newName;
        target.rulesetPath = "xml/javax-package-custom.windup.xml";

        target.delete();
        cy.wait("@deleteRule");
        cy.get("article", { timeout: 12 * SEC }).should("not.contain", target.name);
    });
});
