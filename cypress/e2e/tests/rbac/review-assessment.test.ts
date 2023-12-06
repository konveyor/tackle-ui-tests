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

import { getRandomApplicationData, login, logout } from "../../../utils/utils";
import * as data from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { User } from "../../models/keycloak/users/user";
import { SEC } from "../../types/constants";
import { Application } from "../../models/migration/applicationinventory/application";

describe(["@tier2"], "Assess review with RBAC operations", function () {
    // Polarion TC 312
    const architect = new UserArchitect(data.getRandomUserData());
    const application = new Application(getRandomApplicationData());

    before("Create test data", function () {
        User.loginKeycloakAdmin();
        architect.create();

        login();
        application.create();
        cy.wait(2 * SEC);
        logout();
    });

    beforeEach("Load fixtures", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
    });

    it("Architect, Application assessment and review", function () {
        architect.login();

        application.perform_review("medium");
        cy.wait(2000);
        application.verifyStatus("review", "Completed");

        architect.logout();
    });

    after("Clear test data", () => {
        login();
        application.delete();
        User.loginKeycloakAdmin();
        architect.delete();
    });
});
