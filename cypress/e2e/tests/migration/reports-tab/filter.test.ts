/*
Copyright © 2024 the Konveyor Contributors (https://konveyor.io/)

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
    applySelectFilter,
    clearAllFilters,
    createMultipleApplications,
    createMultipleStakeholders,
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    deleteByList,
    exists,
    login,
    notExists,
    selectFromDropListByText,
} from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../models/migration/applicationinventory/application";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Reports } from "../../../models/migration/reports-tab/reports-tab";
import { cloudNative, legacyPathfinder } from "../../../types/constants";
import {
    identifiedRisksFilterValidations,
    landscapeFilterDropdown,
} from "../../../views/reportsTab.view";

let applications: Application[];
let stakeholder: Stakeholders;

// Polarion TC 469
describe(["@tier3"], "Reports Tab filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.import("questionnaire_import/cloud-native.yaml");
        AssessmentQuestionnaire.enable(cloudNative);
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholder = createMultipleStakeholders(1)[0];
        applications = createMultipleApplications(2);
        applications[0].perform_assessment("high", [stakeholder]);
        applications[1].perform_assessment("medium", [stakeholder]);
        applications[1].perform_assessment("low", [stakeholder], null, cloudNative);
        AssessmentQuestionnaire.disable(cloudNative);
    });

    it("Filter landscape by questionnaire", function () {
        Reports.open(100);
        Reports.verifyRisk(1, 1, 0, 0, "2");
        selectFromDropListByText(landscapeFilterDropdown, legacyPathfinder);
        Reports.verifyRisk(1, 1, 0, 0, "2");
        selectFromDropListByText(landscapeFilterDropdown, cloudNative);
        Reports.verifyRisk(1, 0, 0, 1, "2");
    });

    identifiedRisksFilterValidations.forEach((validation) => {
        it(`Filtering identified risks by ${validation.name}`, function () {
            Reports.open(100);
            applySelectFilter(validation.id, new RegExp(`^${validation.name}$`), validation.text);
            exists(validation.should);
            notExists(validation.shouldNot);
            clearAllFilters();
        });
    });

    after("Clear test data", function () {
        Application.open(true);
        deleteByList(applications);
        stakeholder.delete();
    });
});
