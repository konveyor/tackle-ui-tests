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
    clickByText,
    openManageColumns,
    restoreColumnsToDefault,
    selectColumns,
    validateCheckBoxIsDisabled,
    validateTextPresence,
} from "../../../../utils/utils";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { button, cancel, save } from "../../../types/constants";
import { tableHead } from "../../../views/common.view";
import { TaskManagerTableHeaders } from "../../../views/taskmanager.view";

describe(["@tier3"], "Task manager - table column management validation", function () {
    const taskManagerDefaultColumns = Object.values(TaskManagerTableHeaders).slice(0, 6);
    const columnsToSelect = [
        TaskManagerTableHeaders.pod,
        TaskManagerTableHeaders.started,
        TaskManagerTableHeaders.terminated,
    ];

    it("Open task manager page - table default columns should be visible", function () {
        TaskManager.open();
        taskManagerDefaultColumns.forEach((column) => validateTextPresence(tableHead, column));
        columnsToSelect.forEach((column) => validateTextPresence(tableHead, column, false));
    });

    it("Select columns to display in the table view - they should be visible", function () {
        // Check the unchecked columns and verify that all columns are visible
        TaskManager.open();
        selectColumns(columnsToSelect);
        Object.values(TaskManagerTableHeaders).forEach((column) =>
            validateTextPresence(tableHead, column)
        );
    });

    it("Validate ID checbox in the manage columns window is checked and disabled", function () {
        TaskManager.open();
        openManageColumns();
        validateCheckBoxIsDisabled(TaskManagerTableHeaders.id, true);
        clickByText(button, save);
    });

    it("Validate restoring columns to default", function () {
        TaskManager.open();
        restoreColumnsToDefault();
        taskManagerDefaultColumns.forEach((column) => validateTextPresence(tableHead, column));
    });

    it("Validate cancel button in the manage columns window", function () {
        TaskManager.open();
        openManageColumns();
        clickByText(button, cancel);
        taskManagerDefaultColumns.forEach((column) => validateTextPresence(tableHead, column));
    });
});
