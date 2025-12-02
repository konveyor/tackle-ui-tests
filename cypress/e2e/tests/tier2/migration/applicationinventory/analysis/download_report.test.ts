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
    cleanupDownloads,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../../utils/utils";
import { GeneralConfig } from "../../../../models/administration/general/generalConfig";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { AnalysisStatuses, ReportTypeSelectors } from "../../../../types/constants";

describe(["@tier2"], "Enable and Download HTML and YAML Reports", function () {
    let sourceApplication: Analysis;

    before("Login", function () {
        login();
        cy.visit("/");
        GeneralConfig.enableDownloadReport();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Download YAML Report - Source App", function () {
        sourceApplication = new Analysis(
            getRandomApplicationData("SourceApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        sourceApplication.create();
        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus(AnalysisStatuses.completed);
        sourceApplication.downloadReport(ReportTypeSelectors.YAML);
    });

    after("Cleaning up", function () {
        sourceApplication.delete();
        cleanupDownloads();
    });
});
