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
    getRandomApplicationData,
    login,
    patchTackleCR,
    createMultipleStakeholders,
    deleteByList,
} from "../../../utils/utils";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Application } from "../../models/migration/applicationinventory/application";
import {
    legacyPathfinder,
    cloudReadinessQuestionnaire,
    cloudReadinessFilePath,
    SEC,
} from "../../types/constants";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Analysis } from "../../models/migration/applicationinventory/analysis";

let application = new Application(getRandomApplicationData());
let stakeholders: Stakeholders[];

describe(["@tier5"], "Perform certain operations after disabling Keycloak", function () {
    // Automates Polarion MTA-293
    before("Disable Keycloak", function () {
        login();
        patchTackleCR("keycloak", false);
        application.create();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.import(cloudReadinessFilePath);
        AssessmentQuestionnaire.enable(cloudReadinessQuestionnaire);
        AssessmentQuestionnaire.disable(legacyPathfinder);

        stakeholders = createMultipleStakeholders(1);
    });

    beforeEach("Load data", function () {
        // RBAC rules for architect are applicable to admin as well
        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["architect"];
        });
    });

    it("With Auth disabled, Perform application assessment and review", function () {
        application.perform_assessment("high", stakeholders, null, cloudReadinessQuestionnaire);
        cy.wait(1000);
        application.verifyStatus("assessment", "Completed");

        application.perform_review("low");
        cy.wait(SEC);
        application.verifyStatus("assessment", "Completed");
    });

    it("Validate content of top kebab menu", function () {
        // Import button should be available
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Validate content of application kebab menu", function () {
        application.validateAppContextMenu(this.rbacRules);
    });

    after("Clean up", function () {
        application.delete();
        deleteByList(stakeholders);
    });
});
