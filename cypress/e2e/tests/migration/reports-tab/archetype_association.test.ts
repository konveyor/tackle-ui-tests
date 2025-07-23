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
    createMultipleTags,
    deleteByList,
    login,
} from "../../../../utils/utils";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { legacyPathfinder } from "../../../types/constants";

import * as data from "../../../../utils/data_utils";
import { Archetype } from "../../../models/migration/archetypes/archetype";
import { Reports } from "../../../models/migration/reports-tab/reports-tab";
import { mediumRiskDonut } from "../../../views/reportsTab.view";

let stakeholderList: Array<Stakeholders> = [];

describe(["@tier2"], "Archetype association reports tests", () => {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholderList = createMultipleStakeholders(1);
    });

    it("Validates applications that inherit assessment gets displayed on Reports tab", function () {
        //automates polarion MTA-500
        Reports.getRiskValue(mediumRiskDonut).then((currentRiskValue) => {
            const numericRiskValue = parseInt(currentRiskValue, 10);
            const tags = createMultipleTags(2);
            const archetype = new Archetype(
                data.getRandomWord(8),
                [tags[0].name],
                [tags[1].name],
                null
            );
            archetype.create();
            archetype.perform_assessment("medium", stakeholderList);
            const applications = createMultipleApplications(1, [tags[0].name]);
            Reports.open();
            Reports.verifyRiskValue(mediumRiskDonut, numericRiskValue + 1);
            archetype.delete();
            deleteByList(tags);
            deleteByList(applications);
        });
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholderList);
    });
});
