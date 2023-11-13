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
import { AnalysisStatuses, SEC } from "../../../../types/constants";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { CustomMigrationTarget } from "../../../../models/administration/custom-migration-targets/custom-migration-target";
import * as data from "../../../../../utils/data_utils";
import { getRulesData } from "../../../../../utils/data_utils";

const applications: Analysis[] = [];
describe(["@tier4"], "Source Analysis of big applications", () => {
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
        cy.fixture("custom-rules").then((customMigrationTargets) => {
            this.targetData = customMigrationTargets;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");
        Application.open(100, true);
    });

    it("Bug MTA-1627: Source analysis on PetClinic app", function () {
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
        cy.wait(2 * SEC);

        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
        target.delete();
    });

    it("Bug MTA-1647:Source Analysis on Nexus app", function () {
        const application = new Analysis(
            getRandomApplicationData("Nexus Source", {
                sourceData: this.appData["nexus"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_nexus_app"])
        );
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    it("Source Analysis on OpenMMS app", function () {
        const application = new Analysis(
            getRandomApplicationData("OpenMRS Source", {
                sourceData: this.appData["openmrs"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_openmrs_app"])
        );
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    after("Test data clean up", function () {
        deleteByList(applications);
    });
});
