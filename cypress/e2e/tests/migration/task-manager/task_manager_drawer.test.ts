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
    deleteApplicationTableRows,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { taskDrawerItemTitle, taskNotificationBadge } from "../../../views/common.view";

const analyses: Analysis[] = [];
const NUMBER_OF_APPS = 2;

function validateTasks(taskType: string, expectedTasks: string[]) {
    cy.get(taskDrawerItemTitle).each((item) => {
        cy.wrap(item)
            .invoke("text")
            .then((text) => {
                if (text.includes(taskType)) {
                    // Extract Task ID from the drawer item title; Task ID is present at the start of the string
                    const match = text.match(/^\d+/);
                    if (match) {
                        const taskID = parseInt(match[0], 10);
                        expect(Number.isInteger(taskID), "Task ID should be an integer").to.eq(
                            true
                        );
                    }

                    // Assert that drawer item title contains task type, app name and task priority
                    expect(
                        text.replace(/^\d+\s/, ""),
                        "Task should be in expected list"
                    ).to.be.oneOf(expectedTasks);
                }
            });
    });
}

describe(["@tier2"], "Task Manager Drawer validation", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        deleteApplicationTableRows();
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

    it("Perform bulk analysis and validate tasks on Task Manager Drawer", function () {
        // Automates Polarion TC MTA-556
        Analysis.analyzeAll(analyses[0]);

        cy.get(taskNotificationBadge).click();
        validateTasks("tech-discovery", [
            `(tech-discovery) - ${analyses[0].name} - 0`,
            `(tech-discovery) - ${analyses[1].name} - 0`,
        ]);

        cy.get(taskDrawerItemTitle).contains("analyzer", {
            timeout: 10000,
        });
        validateTasks("analyzer", [
            `(analyzer) - ${analyses[0].name} - 10`,
            `(analyzer) - ${analyses[1].name} - 10`,
        ]);
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        deleteByList(analyses);
    });
});
