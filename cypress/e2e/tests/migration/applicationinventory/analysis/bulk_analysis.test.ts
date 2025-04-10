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
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Metrics } from "../../../../models/migration/custom-metrics/custom-metrics";
import { AnalysisStatuses } from "../../../../types/constants";

const analyses: Analysis[] = [];
const NUMBER_OF_APPS = 25;
const metrics = new Metrics();
const metricName = "konveyor_tasks_initiated_total";
let counter: number;

describe(["@tier4"], "Bulk analysis and custom metrics afterwards", () => {
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

        // Get the current counter value
        metrics.getValue(metricName).then((counterValue) => {
            counter = counterValue;
        });
    });

    it("Bulk analysis and collect metrics afterwards", function () {
        Analysis.analyzeAll(analyses[0]);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);
        counter = counter + NUMBER_OF_APPS;
        metrics.validateMetric(metricName, counter);
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        deleteByList(analyses);
    });
});
