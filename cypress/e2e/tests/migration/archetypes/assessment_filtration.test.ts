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
    clickKebabMenuOptionArchetype,
    createMultipleArchetypes,
    createMultipleStakeholders,
    exists,
    login,
    notExists,
} from "../../../../utils/utils";
import { cloudNative, legacyPathfinder, review } from "../../../types/constants";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { identifiedRisksFilterValidations } from "../../../views/reportsTab.view";
import { Archetype } from "../../../models/migration/archetypes/archetype";

let archetype: Archetype;
let stakeholder: Stakeholders;

describe(["@tier2"], "Review Archetypes Assessment summary filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.import("questionnaire_import/cloud-native.yaml");
        AssessmentQuestionnaire.enable(cloudNative);
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholder = createMultipleStakeholders(1)[0];
        archetype = createMultipleArchetypes(1)[0];
        archetype.perform_assessment("high", [stakeholder]);
        archetype.perform_assessment("medium", [stakeholder], null, cloudNative);
    });

    identifiedRisksFilterValidations.forEach((validation) => {
        it(`Filtering Archetypes Assessment summary by ${validation.name}`, function () {
            Archetype.open(true);
            clickKebabMenuOptionArchetype(archetype.name, review);
            applySelectFilter(validation.id, new RegExp(`^${validation.name}$`), validation.text);
            exists(validation.should);
            notExists(validation.shouldNot);
            clearAllFilters();
        });
    });

    after("Clear test data", function () {
        archetype.delete();
        stakeholder.delete();
    });
});
