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

describe(["@tier3", "@rhsso"], "Migrator RBAC operations", () => {
    let userMigrator = new UserMigrator(getRandomUserData());
    const application = new Application(getRandomApplicationData());

    let appCredentials = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Creating RBAC users, adding roles for them", () => {
        //Need to log in as admin and create simple app with known name to use it for tests
        login();
        cy.visit("/");
        AssessmentQuestionnaire.enable(legacyPathfinder);
        // Navigate to stakeholders control tab and create new stakeholder
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();

        stakeholdersList.push(stakeholder);
        stakeholdersNameList.push(stakeholder.name);

        appCredentials.create();
        application.create();
        application.perform_review("low");
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

    it("Migrator, validate content of application kebab menu", function () {
        application.validateAppContextMenu(this.rbacRules);
    });

    it("Migrator, validate availability of binary upload functionality", function () {
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
