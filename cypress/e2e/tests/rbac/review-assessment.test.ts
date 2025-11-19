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

import * as data from "../../../utils/data_utils";
import {
    createMultipleApplications,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    login,
} from "../../../utils/utils";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { User } from "../../models/keycloak/users/user";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { Application } from "../../models/migration/applicationinventory/application";
import { Archetype } from "../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Tag } from "../../models/migration/controls/tags";
import { legacyPathfinder, SEC } from "../../types/constants";

let tags: Tag[];
let stakeholders: Stakeholders[];
let application: Application[];

describe(["@tier2"], "Perform assessment and review as Architect", function () {
    const architect = new UserArchitect(data.getRandomUserData());

    before("Create test data", function () {
        User.loginKeycloakAdmin();
        architect.create();
        login();
        cy.visit("/");
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);

        architect.login();
        tags = createMultipleTags(2);
        stakeholders = createMultipleStakeholders(1);
        application = createMultipleApplications(1, [tags[0].name]);
    });

    beforeEach("Load fixtures", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
    });

    it("As Architect, perform application and archetype assessment and review", function () {
        // Polarion TC 312 and Polarion MTA-522
        architect.login();
        cy.wait(10 * SEC);
        application[0].perform_assessment("medium", stakeholders);
        application[0].verifyStatus("assessment", "Completed");
        application[0].validateAssessmentField("Medium");

        application[0].perform_review("medium");
        application[0].verifyStatus("review", "Completed");
        application[0].validateReviewFields();

        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        archetype.create();
        archetype.perform_assessment("low", stakeholders);
        archetype.validateAssessmentField("Low");
        archetype.perform_review("low");
        archetype.validateReviewFields();
        archetype.delete();
    });

    after("Clear test data", () => {
        login();
        cy.visit("/");
        application[0].delete();
        deleteByList(tags);
        User.loginKeycloakAdmin();
        architect.delete();
    });
});
