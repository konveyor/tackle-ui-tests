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
    getRandomApplicationData,
    getRandomAnalysisData,
    deleteByList,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { SEC } from "../../../../types/constants";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { AppIssue } from "../../../../types/types";
let applicationsList: Array<Analysis> = [];

describe(["@tier2"], "Bug MTA-2006: Affected files validation", () => {
    before("Login", function () {
        login();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    afterEach("Reset url", function () {
        Application.open(true);
    });

    it("Bug MTA-2006: Affected files validation with Source + dependencies analysis on daytrader app", function () {
        // Automate bug https://issues.redhat.com/browse/MTA-2006
        const application = new Analysis(
            getRandomApplicationData("affected_files_on_day_trader_app", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["affected_files_on_day_trader_app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.validateIssues(this.analysisData["affected_files_on_day_trader_app"]["issues"]);
        this.analysisData["affected_files_on_day_trader_app"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
    });
});
