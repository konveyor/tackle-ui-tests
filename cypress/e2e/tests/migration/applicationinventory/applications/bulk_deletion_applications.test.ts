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
    application_inventory_kebab_menu,
    click,
    createMultipleApplications,
    login,
    navigate_to_application_inventory,
} from "../../../../../utils/utils";

import { Application } from "../../../../models/migration/applicationinventory/application";
import {
    applicationsActionButton,
    appSelectionButton,
    bulkApplicationSelectionCheckBox,
} from "../../../../views/applicationinventory.view";
import * as commonView from "../../../../views/common.view";

describe(["@tier3"], "Bulk deletion of applications", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        Application.open(true);
        createMultipleApplications(1);
        cy.get("tr.pf-m-clickable").then(($rows) => {
            if ($rows.length > 1) {
                verifyDeleteButton();
            }
        });
    });

    beforeEach("Interceptors", function () {
        Application.open(true);
        createMultipleApplications(11);
        cy.intercept("POST", "/hub/tag*").as("postTag");
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Bulk deletion of applications - Select page ", function () {
        navigate_to_application_inventory();
        cy.get(appSelectionButton).eq(0).click();
        cy.get("ul[role=menu] > li").contains("Select page").click();
        application_inventory_kebab_menu("Delete");
        click(commonView.confirmButton);
    });

    it("Bulk deletion of applications - Select all ", function () {
        navigate_to_application_inventory();
        cy.get(appSelectionButton).eq(0).click();
        cy.get("ul[role=menu] > li").contains("Select all").click();
        application_inventory_kebab_menu("Delete");
        click(commonView.confirmButton);
    });

    it("Bulk deletion of applications - Delete all apps by selecting checkbox ", function () {
        navigate_to_application_inventory();
        cy.get(bulkApplicationSelectionCheckBox).check({ force: true });
        application_inventory_kebab_menu("Delete");
        click(commonView.confirmButton);
    });

    const verifyDeleteButton = () => {
        cy.get(appSelectionButton).eq(0).click();
        cy.get("ul[role=menu] > li").contains("Select all").click();
        cy.get(applicationsActionButton).eq(0).click({ force: true });
        cy.get("li.pf-v5-c-menu__list-item")
            .contains("Delete")
            .then(($deleteButton) => {
                if ($deleteButton.parent().hasClass("pf-m-aria-disabled")) {
                    expect(
                        true,
                        "The Bulk Delete button is disabled, which may be caused by undeleted migration waves from previous tests."
                    ).to.eq(false);
                }
            });
    };
});
