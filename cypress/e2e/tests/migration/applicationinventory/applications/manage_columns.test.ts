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
    openManageColumns,
    restoreColumnsToDefault,
    validateTextPresence,
    validateCheckBoxIsDisabled,
    clickByText,
    getCheckboxSelector,
} from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { button, save, trTag } from "../../../../types/constants";
import { manageColumnsModal } from "../../../../views/applicationinventory.view";

const applicationInventoryTableColumns = [
    "Name",
    "Business Service",
    "Assessment",
    "Review",
    "Analysis",
    "Tags",
    "Effort",
];
const columnsToShuffleAndTest = [...applicationInventoryTableColumns.slice(1)];

describe(["@tier3"], "Application inventory managing columns validations", function () {
    //automates polarion MTA537
    before("Login and validate data", function () {
        login();
        Application.open();
        applicationInventoryTableColumns.forEach((column) =>
            validateTextPresence(trTag, column, true)
        );
    });

    it("Validates managing columns", function () {
        Application.open();
        validateManagingColumns();
        openManageColumns();
        validateCheckBoxIsDisabled("Name", true);
        clickByText(button, save, true);
    });

    it("Validates restoring columns to default", function () {
        Application.open();
        restoreColumnsToDefault();
        applicationInventoryTableColumns.forEach((column) =>
            validateTextPresence(trTag, column, true)
        );
    });

    const validateManagingColumns = () => {
        openManageColumns();
        // randomly choose two columns and select them
        const shuffledColumns = Cypress._.shuffle(columnsToShuffleAndTest);
        const selectedColumns = shuffledColumns.slice(0, 2);
        cy.get(manageColumnsModal).within(() => {
            selectedColumns.forEach((column) => {
                cy.get(getCheckboxSelector(column)).click();
            });
            clickByText(button, save, true);
        });
        selectedColumns.forEach((column) => validateTextPresence(trTag, column, false));
    };
});
