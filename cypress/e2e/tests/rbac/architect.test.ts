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

import { User } from "../../models/keycloak/users/user";
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import {
    createMultipleStakeholders,
    getRandomApplicationData,
    login,
    logout,
} from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialType } from "../../types/constants";
import { Application } from "../../models/migration/applicationinventory/application";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import { Stakeholders } from "../../models/migration/controls/stakeholders";

describe(["@tier2", "@rhsso"], "Architect RBAC operations", function () {
    let userArchitect = new UserArchitect(getRandomUserData());
    const application = new Assessment(getRandomApplicationData());

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Creating RBAC users, adding roles for them", function () {
        login();
        appCredentials.create();
        application.create();
        application.perform_review("low");
        logout();
        User.loginKeycloakAdmin();
        userArchitect.create();
    });

    beforeEach("Persist session", function () {
        // login as architect
        userArchitect.login();

        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["architect"];
        });
    });

    it("Architect, validate create application button", function () {
        //Architect is allowed to create applications
        Application.validateCreateAppButton(this.rbacRules);
    });

    it("Architect, validate assess application button", function () {
        //Architect is allowed to create applications
        application.validateAssessButton(this.rbacRules);
    });

    it("Architect, validate review application button", function () {
        //Architect is allowed to review applications
        application.validateReviewButton(this.rbacRules);
    });

    it("Architect, validate presence of import and manage imports", function () {
        //Architect is allowed to import applications
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Architect, validate presence of analyse button", function () {
        //Architect is allowed to analyse applications
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("Architect, validate analysis and assessment context menu buttons presence", function () {
        application.validateAnalysisAvailableActions(this.rbacRules);
    });

    it("Architect, validate availability of binary upload functionality", function () {
        application.validateUploadBinary(this.rbacRules);
    });

    after("", function () {
        userArchitect.logout();
        login();
        appCredentials.delete();
        application.delete();
        logout();
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
