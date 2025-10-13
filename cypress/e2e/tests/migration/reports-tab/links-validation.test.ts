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
    createMultipleApplications,
    createMultipleStakeholders,
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    deleteByList,
    getTableColumnData,
    login,
} from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../models/migration/applicationinventory/application";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Reports } from "../../../models/migration/reports-tab/reports-tab";
import { legacyPathfinder, name, SEC } from "../../../types/constants";

let stakeholdersList: Array<Stakeholders> = [];
let applicationsList: Array<Application> = [];

let riskType = ["high", "medium", "low", "unknown"];

// Automates Polarion TCs 429 & 430
describe(["@tier3"], "Reports tab links validation tests", () => {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholdersList = createMultipleStakeholders(1);
        applicationsList = createMultipleApplications(5);

        for (let i = 0; i < riskType.length; i++) {
            applicationsList[i].perform_assessment(riskType[i], stakeholdersList);
            applicationsList[i].verifyStatus("assessment", "Completed");

            applicationsList[i].perform_review(riskType[i]);
            applicationsList[i].verifyStatus("review", "Completed");
        }
    });

    it("Risk links validation", function () {
        riskType.forEach((risk, i) => {
            Reports.open();
            if (risk === "unknown") {
                cy.contains("a", `${risk}`, { matchCase: false, timeout: 5 * SEC }).click();
            } else {
                cy.contains("a", `${risk} risk`, { matchCase: false, timeout: 5 * SEC }).click();
            }
            cy.wrap(getTableColumnData(name)).then((appNames) =>
                expect(appNames, `${risk} risk link validation`).to.be.deep.equal([
                    applicationsList[i].name,
                ])
            );
        });

        Reports.open();
        cy.contains("a", "Unassessed", { timeout: 10 * SEC }).click();
        cy.wrap(getTableColumnData(name)).then((appNames) =>
            expect(appNames, "Unassessed link validation").to.be.deep.equal([
                applicationsList.at(-1).name,
            ])
        );
    });

    it("Identified Risks links validation", function () {
        Reports.open(100);
        cy.contains("a", "1 application").click();
        cy.wrap(getTableColumnData(name)).then((appNames) =>
            expect(appNames.length, "1 app link validation").equal(1)
        );

        Reports.open(100);
        cy.contains("a", "2 applications").click();
        cy.wrap(getTableColumnData(name)).then((appNames) =>
            expect(appNames.length, "2 apps link validation").equal(2)
        );
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholdersList);
        deleteByList(applicationsList);
    });
});
