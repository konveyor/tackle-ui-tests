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

import * as data from "../../../../../utils/data_utils";
import * as commonView from "../../../../views/common.view";
import { login, createMultipleTags, deleteByList, sidedrawerTab } from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { SEC } from "../../../../types/constants";

let applicationList: Array<Application> = [];
let archetypeList: Array<Archetype> = [];

describe(["@tier2"], "Tests related to application-archetype association ", () => {
    before("Login", function () {
        login();
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Archetype association - Application creation before archetype creation ", function () {
        const tags = createMultipleTags(2);
        const appdata = {
            name: data.getAppName(),
            description: data.getDescription(),
            tags: [tags[0].name],
            comment: data.getDescription(),
        };

        const application = new Application(appdata);
        applicationList.push(application);
        application.create();
        cy.wait(2 * SEC);

        const archetypeList = [];
        const archetype1 = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null
        );
        archetype1.create();
        cy.wait(2 * SEC);
        archetypeList.push(archetype1);

        Application.open();
        sidedrawerTab(application.name, "Details");
        cy.get(commonView.sideDrawer.associatedArchetypes).contains("Associated archetypes");
        cy.get(commonView.sideDrawer.riskValue).contains(archetype1.name);
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationList);
        deleteByList(archetypeList);
    });
});
