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
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { Application } from "../../models/migration/applicationinventory/application";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
const metrics = new Metrics();
const metricName = "konveyor_tasks_initiated_total";
let applicationList: Array<Application> = [];
let counter: number;

describe(["@tier2"], "Custom Metrics - Count the total number of initiated analyses", function () {
    before("Log in and clear state", function () {
        login();
        cy.visit("/");
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
    });

    beforeEach("Load data and define interceptors", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");

        // Get the current counter value
        metrics.getValue(metricName).then((counterValue) => {
            counter = counterValue;
        });
        Application.open(true);
    });

    it("Perform source analysis - Validate the tasks initiated counter increased", function () {
        // For source code analysis application must have source code URL git or svn
        const bookServerApp = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        bookServerApp.create();
        // Counter increases by discovery tasks
        counter += 2;
        cy.wait("@getApplication");
        bookServerApp.analyze();
        bookServerApp.verifyAnalysisStatus("Completed");

        // Counter increases by analyzer task
        counter++;
        applicationList.push(bookServerApp);

        // Validate the tasks initiated counter increased
        metrics.validateMetric(metricName, counter);
    });

    it("Perform binary analysis - Validate discovery tasks are not initiated", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );

        // Application with empty source code should not initiate the discovery tasks
        application.create();
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        counter++;
        applicationList.push(application);
        metrics.validateMetric(metricName, counter);
    });

    it("Bug MTA-5633: Perform analysis on tackle-testapp without credentials - Validate analysis failed but counter increased", function () {
        // For tackle test app source credentials are required.
        const tackleTestApp = new Analysis(
            getRandomApplicationData("tackle-testapp", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_tackletestapp"])
        );
        tackleTestApp.create();
        cy.wait("@getApplication");
        tackleTestApp.analyze();
        tackleTestApp.verifyAnalysisStatus("Failed");

        counter += 3;
        applicationList.push(tackleTestApp);

        // Validate the tasks initiated counter increased
        metrics.validateMetric(metricName, counter);
    });

    it("Delete applications - Validate the tasks initiated counter didn't change", function () {
        deleteApplicationTableRows();
        metrics.validateMetric(metricName, counter);
    });
});
