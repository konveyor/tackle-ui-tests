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

import * as data from "../../../../../utils/data_utils";
import { getRulesData } from "../../../../../utils/data_utils";
import {
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../../utils/utils";
import { CustomMigrationTarget } from "../../../../models/administration/custom-migration-targets/custom-migration-target";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { AnalysisStatuses, MIN } from "../../../../types/constants";

const applications: Analysis[] = [];
describe(["@tier2"], "Source Analysis of big applications", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
        cy.fixture("custom-rules").then((customMigrationTargets) => {
            this.targetData = customMigrationTargets;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");
        Application.open(true);
    });

    it("Source analysis on PetClinic app", function () {
        const target = new CustomMigrationTarget(
            data.getRandomWord(8),
            data.getDescription(),
            this.targetData["hazelcast_target"].image,
            getRulesData(this.targetData["hazelcast_target"])
        );
        target.create();

        const application = new Analysis(
            getRandomApplicationData("PetClinic Source", {
                sourceData: this.appData["pet-clinic"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_pet_clinic_app"])
        );

        application.target = [target.name];
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
        target.delete();
    });

    it("Source Analysis on Nexus app", function () {
        const application = new Analysis(
            getRandomApplicationData("Nexus Source", {
                sourceData: this.appData["nexus"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_nexus_app"])
        );
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed, 60 * MIN);
    });

    it("Source Analysis on OpenMRS app", function () {
        const application = new Analysis(
            getRandomApplicationData("OpenMRS Source", {
                sourceData: this.appData["openmrs"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_openmrs_app"])
        );
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed, 30 * MIN);
    });

    it("Source + dependency Analysis on Nexus app", function () {
        const application = new Analysis(
            getRandomApplicationData("Nexus Source+dep", {
                sourceData: this.appData["nexus"],
            }),
            getRandomAnalysisData(this.analysisData["source_plus_dependency_analysis_on_nexus_app"])
        );
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed, 60 * MIN);
        application.verifyEffort(
            this.analysisData["source_plus_dependency_analysis_on_nexus_app"]["effort"]
        );
    });

    after("Test data clean up", function () {
        Analysis.open(true);
        deleteByList(applications);
    });
});
