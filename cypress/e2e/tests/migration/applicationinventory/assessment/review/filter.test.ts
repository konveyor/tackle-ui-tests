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
    clickItemInKebabMenu,
    clickKebabMenuOptionArchetype,
    createMultipleApplications,
    createMultipleArchetypes,
    createMultipleStakeholders,
    exists,
    login,
    notExists,
} from "../../../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Application } from "../../../../../models/migration/applicationinventory/application";
import { Archetype } from "../../../../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../../../../models/migration/controls/stakeholders";
import { cloudNative, legacyPathfinder, review } from "../../../../../types/constants";
import { identifiedRisksFilterValidations } from "../../../../../views/reportsTab.view";

let application: Application;
let stakeholder: Stakeholders;
let archetype: Archetype;

// Polarion TC 495 and TC 541
describe(["@tier3"], "Review Identified Risks filter validations for assessments", function () {
    before("Login and Create Test Data", function () {
        login();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.import("questionnaire_import/cloud-native.yaml");
        AssessmentQuestionnaire.enable(cloudNative);
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholder = createMultipleStakeholders(1)[0];
        archetype = createMultipleArchetypes(1)[0];
        application = createMultipleApplications(1)[0];
        application.perform_assessment("high", [stakeholder]);
        application.perform_assessment("medium", [stakeholder], null, cloudNative);
        application.verifyStatus("assessment", "Completed");
        archetype.perform_assessment("high", [stakeholder]);
        Archetype.open(true);
        archetype.perform_assessment("medium", [stakeholder], null, cloudNative);
        archetype.validateAssessmentField("High");
    });

    identifiedRisksFilterValidations.forEach((validation) => {
        it(`Bug MTA-2784: Filtering identified risks by ${validation.name}`, function () {
            const commonActions = () => {
                applySelectFilter(
                    validation.id,
                    new RegExp(`^${validation.name}$`),
                    validation.text
                );
                exists(validation.should);
                notExists(validation.shouldNot);
                clearAllFilters();
            };

            Application.open();
            clickItemInKebabMenu(application.name, review);
            commonActions();
            Archetype.open();
            clickKebabMenuOptionArchetype(archetype.name, review);
            commonActions();
        });
    });

    after("Clear test data", function () {
        Archetype.open(true);
        archetype.delete();
        application.delete();
        stakeholder.delete();
    });
});
