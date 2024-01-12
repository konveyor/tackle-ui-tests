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
import {
    click,
    login,
    createMultipleTags,
    createMultipleArchetypes,
    deleteByList,
    sidedrawerTab,
} from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { SEC } from "../../../../types/constants";
import { Tag } from "../../../../models/migration/controls/tags";

let applicationList: Array<Application> = [];
let archetypes: Array<Archetype> = [];
let tags: Tag[];

describe(["@tier2"], "Tests related to application-archetype association ", () => {
    before("Login", function () {
        login();
        tags = createMultipleTags(2);
    });

    it("Archetype association - Application creation before archetype creation ", function () {
        // Automates Polarion MTA-400
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
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null
        );
        archetype.create();
        cy.wait(2 * SEC);
        archetypeList.push(archetype);

        // Assert that associated archetypes are listed on app drawer after application gets associated with archetype(s)
        Application.open();
        sidedrawerTab(application.name, "Details");
        cy.get(commonView.sideDrawer.associatedArchetypes).contains("Associated archetypes");
        cy.get(commonView.sideDrawer.labelContent).contains(archetype.name);
        click(commonView.sideDrawer.closeDrawer);
    });

    it("Verify application review from multiple archetypes", function () {
        // Automates MTA-420
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

        archetypes = createMultipleArchetypes(2);

        // Assert that 'Archetypes reviewed' is populated on app drawer after review inheritance
        Application.open();
        sidedrawerTab(application.name, "Details");
        cy.get(commonView.sideDrawer.associatedArchetypes).contains("Associated archetypes");
        cy.get(commonView.sideDrawer.labelContent).contains(archetype.name);
        cy.get(commonView.sideDrawer.associatedArchetypes).contains("Archetypes reviewed");

        // Assert that inherited review details are listed on the 'Reviews' tab
        sidedrawerTab(application.name, "Details");
        click(commonView.sideDrawer.closeDrawer);
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationList);
        deleteByList(archetypeList);
        deleteByList(tags);
    });
});
