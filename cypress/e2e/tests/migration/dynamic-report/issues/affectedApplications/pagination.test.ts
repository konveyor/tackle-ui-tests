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

import { Analysis } from "../../../../../models/migration/applicationinventory/analysis";
import {
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validatePagination,
} from "../../../../../../utils/utils";
import { SEC } from "../../../../../types/constants";
import { getRandomWord } from "../../../../../../utils/data_utils";
import { Issues } from "../../../../../models/migration/dynamic-report/issues/issues";

describe(
    ["@tier3"],
    "Validating application sorting in Issues -> affected applications",
    function () {
        const applicationsList: Array<Analysis> = [];

        before("Login", function () {
            login();

            cy.intercept("GET", "/hub/application*").as("getApplication");
        });

        beforeEach("Loading fixtures", function () {
            cy.fixture("application").then(function (appData) {
                this.appData = appData;
            });
            cy.fixture("analysis").then(function (analysisData) {
                this.analysisData = analysisData;
            });
        });

        it("Creating data for pagination", function () {
            for (let i = 0; i < 6; i++) {
                const bookServerApp = new Analysis(
                    getRandomApplicationData(getRandomWord(8), {
                        sourceData: this.appData["bookserver-app"],
                    }),
                    getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
                );
                const dayTraderApp = new Analysis(
                    getRandomApplicationData("daytrader-app", {
                        sourceData: this.appData["daytrader-app"],
                    }),
                    getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
                );

                applicationsList.push(bookServerApp);
                applicationsList.push(dayTraderApp);
            }
            applicationsList.forEach((application) => {
                application.create();
                cy.wait("@getApplication");
                application.analyze();
                cy.wait(2 * SEC);
                application.verifyAnalysisStatus("Completed");
                application.selectApplication();
            });
        });

        it("Validating pagination in issues -> affected applications", function () {
            Issues.openAffectedApplications(
                this.analysisData["source_analysis_on_bookserverapp"]["issues"][0]["name"]
            );
            validatePagination();
        });

        after("Perform test data clean up", function () {
            Analysis.open(true);
            deleteByList(applicationsList);
        });
    }
);
