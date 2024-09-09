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
    deleteByList,
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { AnalysisStatuses } from "../../../../types/constants";
import { Application } from "../../../../models/migration/applicationinventory/application";

const applications: Analysis[] = [];

describe(["@tier2"], "Gradle Analysis", () => {
    before("Login", function () {
        login();
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");
        Application.open(true);
    });

    // Automates TC 532
    it("Analysis for Gradle JMH application", function () {
        const application = new Analysis(
            getRandomApplicationData("JMH Gradle", {
                sourceData: this.appData["jmh-gradle-example"],
            }),
            {
                source: "Source code + dependencies",
                effort: 36,
                target: [],
            }
        );
        application.customRule = ["jmh-gradle-annotation-state-test-rule.yaml"];
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
        application.verifyEffort(application.effort);
    });

    after("Clear data", function () {
        deleteByList(applications);
    });
});
