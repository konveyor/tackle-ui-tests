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
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { taskNotificationBadge } from "../../../views/common.view";

const analyses: Analysis[] = [];
const NUMBER_OF_APPS = 2;

describe(["@tier3"], "Task drawer validation", () => {
    before("Login", function () {
        login();
        cy.visit("/");

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < NUMBER_OF_APPS; i++) {
                    analyses.push(
                        new Analysis(
                            getRandomApplicationData("bookserverApp", {
                                sourceData: appData["bookserver-app"],
                            }),
                            getRandomAnalysisData(analysisData["analysis_for_openSourceLibraries"])
                        )
                    );
                }
                analyses.forEach((analysis) => analysis.create());
            });
        });
    });

    it("Perform bulk analysis and validate information on task drawer", function () {
        // Automates Polarion TC MTA-556
        Analysis.analyzeAll(analyses[0]);
        cy.get(taskNotificationBadge).click();

        // Assert that Tech discovery tasks are listed
        cy.get("h2.pf-v5-c-notification-drawer__list-item-header-title")
            .eq(0)
            .contains("tech-discovery", { timeout: 6000 })
            .then((item) => {
                let techDiscoverytasks = [
                    `(tech-discovery) - ${analyses[0].name} - 0`,
                    `(tech-discovery) - ${analyses[1].name} - 0`,
                ];

                // Extract Task ID from the drawer item title; Task ID is present at the start of the string
                const match = item.text().match(/^\d+/);
                if (match) {
                    const taskID = parseInt(match[0], 10);
                    expect(Number.isInteger(taskID), "Task ID should be an integer").to.eq(true);
                }

                // Assert that drawer item title contains task type, app name and task priority
                expect(
                    Cypress.$(item)
                        .text()
                        .replace(/^\d+\s/, "")
                ).to.be.oneOf(techDiscoverytasks);
            });

        // Assert that analysis tasks are listed
        cy.get("h2.pf-v5-c-notification-drawer__list-item-header-title")
            .eq(0)
            .contains("analyzer", { timeout: 10000 })
            .then((item) => {
                let analyzerTasks = [
                    `(analyzer) - ${analyses[0].name} - 10`,
                    `(analyzer) - ${analyses[1].name} - 10`,
                ];

                // Extract Task ID from the drawer item title; Task ID is present at the start of the string
                const match = item.text().match(/^\d+/);
                if (match) {
                    const taskID = parseInt(match[0], 10);
                    expect(Number.isInteger(taskID), "Task ID should be an integer").to.eq(true);
                }

                // Assert that drawer item title contains task type, app name and task priority
                expect(
                    Cypress.$(item)
                        .text()
                        .replace(/^\d+\s/, "")
                ).to.be.oneOf(analyzerTasks);
            });
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        deleteByList(analyses);
    });
});
