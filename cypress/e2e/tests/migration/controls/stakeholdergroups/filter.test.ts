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
    clickByText,
    exists,
    click,
    applySearchFilter,
    selectItemsPerPage,
    createMultipleStakeholders,
    createMultipleStakeholderGroups,
    deleteByList,
} from "../../../../../utils/utils";
import {
    button,
    tdTag,
    trTag,
    description,
    clearAllFilters,
    name,
    stakeholders,
} from "../../../../types/constants";

import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import * as commonView from "../../../../../e2e/views/common.view";
import * as data from "../../../../../utils/data_utils";

let stakeholdersList: Array<Stakeholders> = [];
let stakeholderGroupsList: Array<Stakeholdergroups> = [];
const invalidSearchInput = `${data.getRandomNumber()}`;

describe(["@tier2"], "Stakeholder groups filter validations", function () {
    before("Login and Create Test Data", function () {
        login();

        stakeholdersList = createMultipleStakeholders(2);
        stakeholderGroupsList = createMultipleStakeholderGroups(2, stakeholdersList);
    });

    beforeEach("Interceptors", function () {
        cy.intercept("GET", "/hub/stakeholdergroups*").as("getStakeholderGroups");
    });

    it("Bug MTA-1715: Name filter validations", function () {
        Stakeholdergroups.openList();
        cy.get("@getStakeholderGroups");

        const validSearchInput = stakeholderGroupsList[0].name.substring(0, 5);
        applySearchFilter(name, validSearchInput);

        exists(stakeholderGroupsList[0].name);
        if (stakeholderGroupsList[1].name.indexOf(validSearchInput) >= 0) {
            exists(stakeholdersList[1].name);
        }

        clickByText(button, clearAllFilters);
        cy.get("@getStakeholderGroups");

        applySearchFilter(name, invalidSearchInput);

        cy.get("h2").contains("No stakeholder groups available");

        clickByText(button, clearAllFilters);
        cy.get("@getStakeholderGroups");
    });

    it("Bug MTA-1715: Description filter validations", function () {
        Stakeholdergroups.openList();
        cy.get("@getStakeholderGroups");

        const validSearchInput = stakeholderGroupsList[0].description.substring(0, 3);
        applySearchFilter(description, validSearchInput);

        // Assert that stakeholder groups row(s) containing the search text is/are displayed
        exists(stakeholderGroupsList[0].description);
        if (stakeholderGroupsList[1].description.indexOf(validSearchInput) >= 0) {
            exists(stakeholderGroupsList[1].description);
        }

        clickByText(button, clearAllFilters);
        cy.get("@getStakeholderGroups");

        applySearchFilter(description, invalidSearchInput);

        cy.get("h2").contains("No stakeholder groups available");

        clickByText(button, clearAllFilters);
        cy.get("@getStakeholderGroups");
    });

    it("Bug MTA-1715: Member filter validations", function () {
        Stakeholdergroups.openList();
        cy.get("@getStakeholderGroups");

        const validSearchInput = stakeholderGroupsList[0].members[0].substring(0, 3);
        applySearchFilter(stakeholders, validSearchInput);

        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(stakeholderGroupsList[0].name)
            .parent(trTag)
            .within(() => {
                click(commonView.expandRow);
            })
            .get("div > dd")
            .should("contain", stakeholderGroupsList[0].members[0]);

        if (stakeholderGroupsList[1].members[0].indexOf(validSearchInput) >= 0) {
            exists(stakeholderGroupsList[1].members[0]);
        }

        clickByText(button, clearAllFilters);
        cy.get("@getStakeholderGroups");

        applySearchFilter(stakeholders, invalidSearchInput);

        cy.get("h2").contains("No stakeholder groups available");

        clickByText(button, clearAllFilters);
        cy.get("@getStakeholderGroups");
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(stakeholderGroupsList);
    });
});
