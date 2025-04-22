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

import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import {
    createMultipleStakeholders,
    deleteByList,
    getRandomApplicationData,
    login,
} from "../../../utils/utils";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { User } from "../../models/keycloak/users/user";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { Application } from "../../models/migration/applicationinventory/application";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { CredentialType, legacyPathfinder } from "../../types/constants";

let stakeholders: Array<Stakeholders> = [];

describe(["@tier3", "@rhsso"], "Architect RBAC operations", function () {
    let userArchitect = new UserArchitect(getRandomUserData());
    const application = new Application(getRandomApplicationData());

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Creating RBAC users, adding roles for them", function () {
        login();
        cy.visit("/");
        AssessmentQuestionnaire.enable(legacyPathfinder);
        // Navigate to stakeholders control tab and create new stakeholder
        stakeholders = createMultipleStakeholders(1);

        appCredentials.create();
        application.create();
        application.perform_review("low");
        application.perform_assessment("low", stakeholders);

        User.loginKeycloakAdmin();
        userArchitect.create();
    });

    beforeEach("Persist session", function () {
        // login as architect
        userArchitect.login();
        cy.visit("/");
        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["architect"];
        });
    });

    it("Architect, validate create application button", function () {
        //Architect is allowed to create applications
        Application.validateCreateAppButton(this.rbacRules);
    });

    it("Architect, validate content of top kebab menu", function () {
        //Architect is allowed to import applications
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Architect, validate presence of analyse button", function () {
        //Architect is allowed to analyze applications
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("Architect, validate content of application kebab menu", function () {
        application.validateAppContextMenu(this.rbacRules);
    });

    it("Architect, validate availability of binary upload functionality", function () {
        application.validateUploadBinary(this.rbacRules);
    });

    after("Clean up", function () {
        login();
        cy.visit("/");
        appCredentials.delete();
        deleteByList(stakeholders);
        application.delete();
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
