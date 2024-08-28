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

import { clickByText, selectItemsPerPage, selectUserPerspective } from "../../../../utils/utils";
import {
    SEC,
    TaskKind,
    TaskStatus,
    itemsPerPage,
    migration,
    trTag,
} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { tasksStatusColumn } from "../../../views/taskmanager.view";

export class TaskManager {
    static fullUrl = Cypress.env("tackleUrl") + "/tasks";
    static menuName = "Task Manager";

    static open(forceReload = false) {
        if (forceReload) {
            cy.visit(TaskManager.fullUrl, { timeout: 15 * SEC }).then((_) =>
                selectItemsPerPage(itemsPerPage)
            );
            return;
        }

        cy.url().then(($url) => {
            if (!$url.includes(TaskManager.fullUrl)) {
                selectUserPerspective(migration);
                clickByText(navMenu, this.menuName);
                cy.get("h1", { timeout: 60 * SEC }).should("contain", this.menuName);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    static verifyTaskStatus(application: string, kind: TaskKind, status: TaskStatus): void {
        TaskManager.open();
        selectItemsPerPage(itemsPerPage);
        cy.get(trTag)
            .filter(':contains("' + application + '")')
            .filter(':contains("' + kind + '")')
            .within(() => {
                cy.get(tasksStatusColumn).contains(status, { timeout: 30 * SEC });
            });
    }
}
