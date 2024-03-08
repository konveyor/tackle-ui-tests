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
    createMultipleStakeholders,
    createMultipleTags,
    createMultipleApplications,
    login,
} from "../../../utils/utils";
import * as data from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { User } from "../../models/keycloak/users/user";
import { legacyPathfinder, SEC } from "../../types/constants";
import { Application } from "../../models/migration/applicationinventory/application";
import { Archetype } from "../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Tag } from "../../models/migration/controls/tags";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";

let tags: Tag[];
let stakeholders: Stakeholders[];
let application: Application[];

describe(["@tier2"], "Perform assessment and review as Architect", function () {
    const architect = new UserArchitect(data.getRandomUserData());

    before("Create test data", function () {
        User.loginKeycloakAdmin();
        architect.create();
        login();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);

        architect.login();
        cy.wait(2 * SEC);
        tags = createMultipleTags(2);
        stakeholders = createMultipleStakeholders(1);
        application = createMultipleApplications(1, [tags[0].name]);
        architect.logout();
    });

    beforeEach("Load fixtures", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
    });

    it("As Architect, perform application assessment and review", function () {
        // Polarion TC 312
        architect.login();
        application[0].perform_assessment("medium", stakeholders);
        cy.wait(2 * SEC);
        application[0].verifyStatus("assessment", "Completed");
        application[0].validateAssessmentField("Medium");

        application[0].perform_review("medium");
        cy.wait(2 * SEC);
        application[0].verifyStatus("review", "Completed");
        application[0].validateReviewFields();
    });

    it("As Architect, create archetype, perform archetype assessment and review", function () {
        architect.login();
        // Automates P0larion MTA-522
        const archetype = new Archetype(
            data.getRandomWord(8),
            [tags[0].name],
            [tags[1].name],
            null,
            stakeholders
        );
        archetype.create();
        cy.wait(2 * SEC);

        archetype.perform_assessment("low", stakeholders);
        cy.wait(2 * SEC);
        archetype.validateAssessmentField("Low");
        archetype.perform_review("low");
        cy.wait(2 * SEC);
        archetype.validateReviewFields();
        archetype.delete();
        cy.wait(2 * SEC);
    });

    after("Clear test data", () => {
        login();
        application[0].delete();
        User.loginKeycloakAdmin();
        architect.delete();
    });
});
