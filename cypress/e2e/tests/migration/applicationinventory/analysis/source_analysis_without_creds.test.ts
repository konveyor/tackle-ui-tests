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
    checkSuccessAlert,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { infoAlertMessage } from "../../../../views/common.view";
let applicationsList: Array<Analysis> = [];
let application: Analysis;

describe("Source Analysis without credentials", () => {
    before("Load data", function () {
        login();
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

    it(["@tier0"], "Source Analysis on bookserver app and its issues validation", function () {
        // For source code analysis application must have source code URL git or svn
        cy.log(this.analysisData[0]);
        application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        checkSuccessAlert(infoAlertMessage, `Submitted for analysis`);
        application.verifyAnalysisStatus("Completed");
        application.validateIssues(this.analysisData["source_analysis_on_bookserverapp"]["issues"]);
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
    });
});
