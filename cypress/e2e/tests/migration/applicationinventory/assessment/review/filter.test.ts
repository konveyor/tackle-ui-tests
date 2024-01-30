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
    createMultipleApplications,
    createMultipleStakeholders,
    exists,
    login,
    notExists,
} from "../../../../../../utils/utils";
import { cloudNative, legacyPathfinder, review } from "../../../../../types/constants";
import { Stakeholders } from "../../../../../models/migration/controls/stakeholders";
import { Application } from "../../../../../models/migration/applicationinventory/application";
import { AssessmentQuestionnaire } from "../../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { identifiedRisksFilterValidations } from "../../../../../views/reportsTab.view";

let application: Application;
let stakeholder: Stakeholders;

// Polarion TC 495
describe(["@tier2"], "Review Identified Risks filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.import("questionnaire_import/cloud-native.yaml");
        AssessmentQuestionnaire.enable(cloudNative);
        AssessmentQuestionnaire.enable(legacyPathfinder);

        stakeholder = createMultipleStakeholders(1)[0];
        application = createMultipleApplications(1)[0];
        application.perform_assessment("high", [stakeholder]);
        application.perform_assessment("medium", [stakeholder], null, cloudNative);
    });

    identifiedRisksFilterValidations.forEach((validation) => {
        it(`Filtering identified risks by ${validation.name}`, function () {
            Application.open();
            clickItemInKebabMenu(application.name, review);
            applySelectFilter(validation.id, new RegExp(`^${validation.name}$`), validation.text);
            exists(validation.should);
            notExists(validation.shouldNot);
            clearAllFilters();
        });
    });

    after("Clear test data", function () {
        application.delete();
        stakeholder.delete();
    });
});
