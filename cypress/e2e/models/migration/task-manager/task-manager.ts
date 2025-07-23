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
    click,
    clickByText,
    inputText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
    taskDetailsSanity,
} from "../../../../utils/utils";
import {
    migration,
    MIN,
    SEC,
    taskDetails,
    TaskFilter,
    TaskKind,
    TaskStatus,
    trTag,
} from "../../../types/constants";
import { sideKebabMenu } from "../../../views/applicationinventory.view";
import {
    actionMenuItem,
    kebabActionButton,
    searchButton,
    searchInput,
} from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";
import { TaskManagerColumns, tasksStatusColumn } from "../../../views/taskmanager.view";

export class TaskManager {
    static fullUrl = Cypress.config("baseUrl") + "/tasks";
    static menuName = "Task Manager";

    static open(itemsPerPage = 10, forceReload = false) {
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

    private static getTaskRow(
        applicationName: string,
        kind: TaskKind
    ): Cypress.Chainable<JQuery<HTMLTableRowElement>> {
        return cy
            .get(trTag)
            .filter(':contains("' + applicationName + '")')
            .filter(':contains("' + kind + '")');
    }

    public static verifyTaskStatus(application: string, kind: TaskKind, status: TaskStatus) {
        TaskManager.open();
        TaskManager.getTaskRow(application, kind)
            // The assertion will automatically retry as long as the parent command respects the timeout
            .find(tasksStatusColumn, { timeout: 10 * MIN })
            .should("contain.text", status);
    }

    public static applyFilter(filterType: TaskFilter, filterValue: string) {
        selectFilter(filterType);
        inputText(searchInput, filterValue);
        click(searchButton);
        cy.wait(2 * SEC);
    }

    public static setPreemption(
        applicationName: string,
        kind: TaskKind,
        preemption: boolean
    ): void {
        const setPreemption = preemption === true ? "Enable preemption" : "Disable preemption";
        TaskManager.open();
        TaskManager.getTaskRow(applicationName, kind).find(sideKebabMenu).click();
        cy.get(actionMenuItem).contains(setPreemption).click();
    }

    public static verifyPreemption(
        applicationName: string,
        kind: TaskKind,
        preemption: boolean
    ): void {
        TaskManager.getTaskRow(applicationName, kind)
            .find(TaskManagerColumns.preemption, { timeout: 10 * MIN })
            .should("contain.text", preemption);
    }

    public static cancelTask(status: string): void {
        cy.contains(status)
            .closest(trTag)
            .within(() => {
                click(sideKebabMenu);
            });
        if (
            status == TaskStatus.pending ||
            status == TaskStatus.running ||
            status == TaskStatus.ready ||
            status == TaskStatus.postponed
        ) {
            cy.get(actionMenuItem).contains("Cancel").click();
        } else {
            cy.get(actionMenuItem).contains("Cancel").should("not.be.enabled");
        }
    }

    public static cancelAnalysisByStatus(
        appName: string,
        status: TaskStatus,
        enabled = true
    ): void {
        TaskManager.verifyTaskStatus(appName, TaskKind.analyzer, status);
        TaskManager.getTaskRow(appName, TaskKind.analyzer).find(sideKebabMenu).click();
        if (enabled) {
            cy.get(kebabActionButton).contains("Cancel").click();
        } else {
            cy.get(kebabActionButton).contains("Cancel").should("not.be.enabled");
        }
    }

    public static openTaskDetailsByStatus(
        appName: string,
        taskKind: TaskKind,
        taskStatus: TaskStatus = TaskStatus.succeeded
    ) {
        TaskManager.open(10, true);
        TaskManager.verifyTaskStatus(appName, taskKind, taskStatus);
        TaskManager.getTaskRow(appName, taskKind).find(TaskManagerColumns.status).click();
        taskDetailsSanity(appName, taskKind, taskStatus);
    }

    public static openTaskDetailsByKebabMenu(
        appName: string,
        taskKind: TaskKind,
        sanityCheck: boolean = true
    ) {
        TaskManager.open(10, true);
        TaskManager.getTaskRow(appName, taskKind).find(sideKebabMenu).click();
        cy.get(kebabActionButton).contains(taskDetails).click();
        if (sanityCheck) {
            taskDetailsSanity(appName, taskKind);
        }
    }
}
