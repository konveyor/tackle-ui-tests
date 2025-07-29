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
import { getRandomCredentialsData, getRandomUserData } from "../../../utils/data_utils";
import { deleteByList, getRandomApplicationData, login } from "../../../utils/utils";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { User } from "../../models/keycloak/users/user";
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { Application } from "../../models/migration/applicationinventory/application";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { CredentialType, legacyPathfinder } from "../../types/constants";

const stakeholdersList: Array<Stakeholders> = [];
const stakeholdersNameList: Array<string> = [];

describe(["@tier3", "@rhsso", "@rhbk"], "Migrator RBAC operations", () => {
    let userMigrator = new UserMigrator(getRandomUserData());
    const application = new Application(getRandomApplicationData());

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Creating RBAC users, adding roles for them", () => {
        cy.clearLocalStorage();
        login();
        cy.visit("/");
        AssessmentQuestionnaire.enable(legacyPathfinder);
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);

        appCredentials.create();
        application.create();
        application.perform_review("low");
        User.loginKeycloakAdmin();
        userMigrator.create();
    });

    beforeEach("Persist session", function () {
        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["migrator"];
        });
        userMigrator.login();
    });

    it("Migrator, validate create application button", function () {
        Application.validateCreateAppButton(this.rbacRules);
    });

    it("Migrator, validate top action menu", function () {
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Migrator, validate analyze button", function () {
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("Migrator, validate application context menu", function () {
        application.validateAppContextMenu(this.rbacRules);
    });

    it("Migrator, validate ability to upload binary", function () {
        application.validateUploadBinary(this.rbacRules);
    });

    after("", () => {
        login();
        cy.visit("/");
        appCredentials.delete();
        deleteByList(stakeholdersList);
        application.delete();
        User.loginKeycloakAdmin();
        userMigrator.delete();
    });
});
