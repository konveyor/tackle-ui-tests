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
    selectCheckBox,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { infoAlertMessage } from "../../../../views/common.view";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { AnalysisStatuses } from "../../../../types/constants";

let analyses: Analysis[] = [];
const NUMBER_OF_APPS = 25;

describe(["@load"], "Bulk Analysis", () => {
    before("Login", function () {
        login();
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

    it("Bulk analysis of source code + open source deps + known deps", function () {
        Analysis.analyzeAll(analyses[0]);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);
    });

    after("Perform test data clean up", function () {
        Assessment.open(100, true);
        deleteByList(analyses);
    });
});
