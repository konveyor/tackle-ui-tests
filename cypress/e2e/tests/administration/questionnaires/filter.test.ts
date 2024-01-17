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

import { applySearchFilter, clickByText, exists, login, notExists } from "../../../../utils/utils";
import { button, clearAllFilters, name } from "../../../types/constants";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";

const yamlFileName = "questionnaire_import/cloud-native.yaml";
const importedQuestionnaire = "Cloud Native";
const legacyQuestionnaire = "Legacy Pathfinder";
let assessmentQuestionnaireList: Array<string> = [];

describe(["@tier2"], "Assessment Questionnaire filter validation", () => {
    before("Login", function () {
        login();
        AssessmentQuestionnaire.import(yamlFileName);
        AssessmentQuestionnaire.enable(importedQuestionnaire, false);
        assessmentQuestionnaireList.push(importedQuestionnaire);
        assessmentQuestionnaireList.push(legacyQuestionnaire);
    });

    it("Name filter validation", function () {
        // Automates Polarion MTA-434

        AssessmentQuestionnaire.open();

        let searchInput = assessmentQuestionnaireList[0];

        applySearchFilter(name, searchInput);
        exists(assessmentQuestionnaireList[0]);
        notExists(assessmentQuestionnaireList[1]);
        clickByText(button, clearAllFilters);

        searchInput = assessmentQuestionnaireList[1];

        applySearchFilter(name, searchInput);
        exists(assessmentQuestionnaireList[1]);
        notExists(assessmentQuestionnaireList[0]);
        clickByText(button, clearAllFilters);
    });

    after("Perform test data clean up", function () {
        AssessmentQuestionnaire.delete(importedQuestionnaire);
    });
});
