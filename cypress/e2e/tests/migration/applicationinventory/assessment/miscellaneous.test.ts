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
    createMultipleApplications,
    deleteByList,
    checkSuccessAlert,
} from "../../../../../utils/utils";

import * as data from "../../../../../utils/data_utils";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Assessment } from "../../../../models/migration/applicationinventory/assessment";
import { AssessmentQuestionnaire } from "../../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { alertTitle } from "../../../../views/common.view";

const fileName = "Legacy Pathfinder";
let stakeholderList: Array<Stakeholders> = [];
let stakeholderNameList: Array<string> = [];
let applicationList: Array<Assessment> = [];

describe(["@tier3"], "Tests related to application assessment and review", () => {
    before("Perform application assessment and review", function () {
        login();
        cy.intercept("GET", "/hub/application*").as("getApplication");

        AssessmentQuestionnaire.enable(fileName);

        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2000);
        stakeholderList.push(stakeholder);
        stakeholderNameList.push(stakeholder.name);

        applicationList = createMultipleApplications(1);
        applicationList[0].perform_assessment("low", stakeholderNameList);
        cy.wait(2000);
        applicationList[0].verifyStatus("assessment", "Completed");
        applicationList[0].perform_review("low");
        cy.wait(2000);
        applicationList[0].verifyStatus("review", "Completed");
    });

    it("Discard Assessment", function () {
        applicationList[0].selectKebabMenuItem("Discard assessment(s)");
        checkSuccessAlert(
            alertTitle,
            `Success alert:Success! Assessment discarded for ${applicationList[0].name}.`
        );
        applicationList[0].verifyStatus("assessment", "Not started");
    });

    it("Discard Review", function () {
        applicationList[0].selectKebabMenuItem("Discard review");
        checkSuccessAlert(
            alertTitle,
            `Success alert:Success! Review discarded for ${applicationList[0].name}.`
        );
        applicationList[0].verifyStatus("review", "Not started");
    });

    after("Perform test data clean up", function () {
        deleteByList(stakeholderList);
        deleteByList(applicationList);
    });
});
