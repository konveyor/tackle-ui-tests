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
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validatePagination,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Dependencies } from "../../../../models/migration/dynamic-report/dependencies/dependencies";

describe(["@tier3"], "Bug MTA-4598 - Dependencies pagination validation", function () {
    let application: Analysis;
    before("Load data", function () {
        login();
        cy.visit("/");
        cy.fixture("application")
            .then(function (appData) {
                this.appData = appData;
            })
            .then(function () {
                cy.fixture("analysis").then(function (analysisData) {
                    this.analysisData = analysisData;
                });
            })
            .then(function () {
                application = new Analysis(
                    getRandomApplicationData("bookserver-app", {
                        sourceData: this.appData["bookserver-app"],
                    }),
                    getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
                );
                application.create();
                application.analyze();
                application.verifyAnalysisStatus("Completed");
            });
    });

    it("Pagination validation", function () {
        Dependencies.openList(10);
        validatePagination();
    });

    after("Clean up", function () {
        application.delete();
    });
});
