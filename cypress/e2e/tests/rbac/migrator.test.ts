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
import { UserMigrator } from "../../models/keycloak/users/userMigrator";
import { deleteByList, getRandomApplicationData, login, logout } from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { CredentialsSourceControlUsername } from "../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialType, legacyPathfinder, SEC } from "../../types/constants";
import { Application } from "../../models/migration/applicationinventory/application";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { AssessmentQuestionnaire } from "../../models/administration/assessment_questionnaire/assessment_questionnaire";
import * as data from "../../../utils/data_utils";

const stakeholdersList: Array<Stakeholders> = [];
const stakeholdersNameList: Array<string> = [];

describe(["@tier2", "@rhsso"], "Migrator RBAC operations", () => {
    let userMigrator = new UserMigrator(getRandomUserData());
    const application = new Assessment(getRandomApplicationData());

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Creating RBAC users, adding roles for them", () => {
        //Need to log in as admin and create simple app with known name to use it for tests
        login();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait(2 * SEC);

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);

        appCredentials.create();
        application.create();
        application.perform_review("low");
        logout();
        //Logging in as keycloak admin to create migrator user and test it
        User.loginKeycloakAdmin();
        userMigrator.create();
    });

    beforeEach("Persist session", function () {
        // Login as Migrator
        userMigrator.login();

        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["migrator"];
        });
    });

    it("Migrator, validate create application button", function () {
        //Migrator is not allowed to create applications
        Application.validateCreateAppButton(this.rbacRules);
    });

    it("Migrator, validate content of top kebab menu", function () {
        //migrator is allowed to import applications
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Migrator, validate presence of analyse button", function () {
        //Migrator is allowed to analyse applications
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("BUG MTA-1640 - Migrator, validate content of application kebab menu", function () {
        application.validateAppContextMenu(this.rbacRules);
    });

    it("Migrator, validate availability of binary upload functionality", function () {
        application.validateUploadBinary(this.rbacRules);
    });

    after("", () => {
        userMigrator.logout();
        login();
        appCredentials.delete();
        deleteByList(stakeholdersList);
        application.delete();
        logout();
        User.loginKeycloakAdmin();
        userMigrator.delete();
    });
});
