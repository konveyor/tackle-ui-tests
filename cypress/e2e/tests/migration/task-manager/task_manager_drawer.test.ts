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
import { AnalysisStatuses } from "../../../types/constants";

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
        Analysis.analyzeAll(analyses[0]);
        cy.get(taskNotificationBadge).click();
        cy.get("h2.pf-v5-c-notification-drawer__list-item-header-title")
            .eq(0)
            .contains("analyzer", { timeout: 10000 })
            .then((item) => {
                let appNames = [
                    `(analyzer) - ${analyses[0].name} - 10`,
                    `(analyzer) - ${analyses[1].name} - 10`,
                ];
                expect(Cypress.$(item).text().substring(3)).to.be.oneOf(appNames);
            });
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        deleteByList(analyses);
    });
});
