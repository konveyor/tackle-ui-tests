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

describe(["@tier3", "@rhsso", "@rhbk"], "Bug MTA-5631: Architect RBAC operations", function () {
    // https://issues.redhat.com/browse/MTA-5631
    let userArchitect = new UserArchitect(getRandomUserData());
    const application = new Application(getRandomApplicationData());

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Creating RBAC users, adding roles for them", function () {
        cy.clearLocalStorage();
        User.loginKeycloakAdmin();
        userArchitect.create();

        login();
        cy.visit("/");
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholders = createMultipleStakeholders(1);

        appCredentials.create();
        application.create();
        application.perform_review("low");
        application.perform_assessment("low", stakeholders);
        userArchitect.login();
    });

    beforeEach("Persist session", function () {
        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["architect"];
        });
        userArchitect.login();
    });

    it("Architect, validate create application button", function () {
        Application.validateCreateAppButton(this.rbacRules);
    });

    it("Architect, validate top action menu", function () {
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Architect, validate analyze button", function () {
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("Bug MTA-5631: Architect, validate application context menu", function () {
        application.validateAppContextMenu(this.rbacRules);
    });

    it("Architect, validate ability to upload binary", function () {
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
