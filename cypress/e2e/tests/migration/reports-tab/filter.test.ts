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
import { cloudNative, legacyPathfinder } from "../../../types/constants";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Application } from "../../../models/migration/applicationinventory/application";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Reports } from "../../../models/migration/reports-tab/reports-tab";
import { landscapeFilterDropdown } from "../../../views/reportsTab.view";

let applications: Application[];
let stakeholder: Stakeholders;

describe(["@tier2"], "Reports Tab filter validations", function () {
    const filterValidations: {
        id: string;
        name: string;
        text: string;
        should: string;
        shouldNot: string;
    }[] = [
        {
            id: "section",
            name: "Section",
            text: "Application details",
            should: "Application details",
            shouldNot: "Application technologies",
        },
        {
            id: "question",
            name: "Question",
            text: "How is the application supported in production?",
            should: "External support provider with a ticket-driven escalation process; no inhouse support resources",
            shouldNot: "How often is the application deployed to production?",
        },
        {
            id: "answer",
            name: "Answer",
            text: "Multiple legal and licensing requirements",
            should: "Does the application have legal and/or licensing requirements?",
            shouldNot: "Not tracked",
        },
        {
            id: "questionnaireName",
            name: "Questionnaire",
            text: "Cloud Native",
            should: "What is the main technology in your application?",
            shouldNot: "Legacy Pathfinder",
        },
        { id: "risk", name: "Risk", text: "Low", should: "Spring Boot", shouldNot: "Not tracked" },
    ];

    before("Login and Create Test Data", function () {
        login();
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        AssessmentQuestionnaire.deleteAllQuesionnaire();
        AssessmentQuestionnaire.import("questionnaire_import/cloud-native.yaml");
        AssessmentQuestionnaire.enable(cloudNative);
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholder = createMultipleStakeholders(1)[0];
        applications = createMultipleApplications(2);
        applications[0].perform_assessment("high", [stakeholder]);
        applications[0].perform_assessment("medium", [stakeholder], null, cloudNative);
        applications[1].perform_assessment("low", [stakeholder], null, cloudNative);
        AssessmentQuestionnaire.disable(legacyPathfinder);
    });

    it.skip("Bug MTA-2093: Filter landscape by questionnaire", function () {
        Reports.open(100);
        Reports.verifyRisk(1, 0, 1, 0, "2");
        selectFromDropListByText(landscapeFilterDropdown, legacyPathfinder);
        Reports.verifyRisk(0, 0, 1, 1, "2");
    });

    filterValidations.forEach((validation) => {
        it(`Filtering identified risks by ${validation.name}`, function () {
            Reports.open(100);
            applySelectFilter(validation.id, new RegExp(`^${validation.name}$`), validation.text);
            exists(validation.should);
            notExists(validation.shouldNot);
            clearAllFilters();
        });
    });

    after("Clear test data", function () {
        deleteByList(applications);
        stakeholder.delete();
    });
});
