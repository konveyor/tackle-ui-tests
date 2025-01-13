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
    normalizeText,
    selectFilter,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import {
    SEC,
    TaskKind,
    TaskStatus,
    migration,
    TaskFilter,
    trTag,
    MIN,
    taskDetails,
} from "../../../types/constants";
import { sideKebabMenu } from "../../../views/applicationinventory.view";
import {
    actionMenuItem,
    kebabActionButton,
    searchButton,
    searchInput,
    taskDetailsEditor,
} from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";
import { TaskManagerColumns, tasksStatusColumn } from "../../../views/taskmanager.view";

export class TaskManager {
    static fullUrl = Cypress.env("tackleUrl") + "/tasks";
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
        application: string,
        kind: TaskKind
    ): Cypress.Chainable<JQuery<HTMLTableRowElement>> {
        return cy
            .get(trTag)
            .filter(':contains("' + application + '")')
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

    public static setPreemption(preemption: boolean): void {
        const setPreemption = preemption === true ? "Enable preemption" : "Disable preemption";
        TaskManager.open();
        cy.contains("Pending")
            .closest(trTag)
            .within(() => {
                click(sideKebabMenu);
            });
        cy.get(actionMenuItem).contains(setPreemption).click();
    }

    public static cancelTask(status: string): void {
        TaskManager.open();
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
        TaskManager.open();
        TaskManager.verifyTaskStatus(appName, TaskKind.analyzer, status);
        TaskManager.getTaskRow(appName, TaskKind.analyzer).find(sideKebabMenu).click();
        if (enabled) {
            cy.get(kebabActionButton).contains("Cancel").click();
        } else {
            cy.get(kebabActionButton).contains("Cancel").should("not.be.enabled");
        }
    }

    private static taskDetailsSanity(appName: string, taskKind: TaskKind, taskStatus?: TaskStatus) {
        cy.wait(2 * SEC);
        cy.get(taskDetailsEditor)
            .invoke("text")
            .then((text) => {
                const normalizedText = normalizeText(text);
                expect(normalizedText).to.include(`name: ${appName}-${taskKind}`);
                expect(normalizedText).to.include(`kind: ${taskKind}`);
                if (taskStatus) {
                    expect(normalizedText).to.include(`state: ${taskStatus}`);
                }
            });
    }

    public static openTaskDetailsByStatus(
        appName: string,
        taskKind: TaskKind,
        taskStatus: TaskStatus = TaskStatus.succeeded
    ) {
        TaskManager.open(10, true);
        TaskManager.verifyTaskStatus(appName, taskKind, taskStatus);
        TaskManager.getTaskRow(appName, taskKind).find(TaskManagerColumns.status).click();
        TaskManager.taskDetailsSanity(appName, taskKind, taskStatus);
    }

    public static openTaskDetailsByKebabMenu(appName: string, taskKind: TaskKind) {
        TaskManager.open(10, true);
        TaskManager.getTaskRow(appName, taskKind).find(sideKebabMenu).click();
        cy.get(kebabActionButton).contains(taskDetails).click();
        TaskManager.taskDetailsSanity(appName, taskKind);
    }
}
