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
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    logout,
    preservecookies,
} from "../../../utils/utils";
import * as data from "../../../utils/data_utils";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { User } from "../../models/keycloak/users/user";
import { GeneralConfig } from "../../models/administration/general/generalConfig";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import { SEC } from "../../types/constants";

describe(["tier2"], "Assess review with RBAC operations", function () {
    // Polarion TC 312
    const architect = new UserArchitect(data.getRandomUserData());
    const application = new Assessment(getRandomApplicationData());
    const generalConfig = GeneralConfig.getInstance();

    before("Create test data", function () {
        if (hasToBeSkipped("@tier2")) return;
        User.loginKeycloakAdmin();
        architect.create();

        login();

        // Navigate to application inventory tab and create new application
        application.create();
        cy.wait(2 * SEC);
    });

    beforeEach("Persist session", function () {
        login();

        preservecookies();

        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
    });

    it("Architect, Enable review without assessment", function () {
        // Enable allow reviewing applications without running an assessment first button
        generalConfig.enableReviewAssessment();

        // Logout from admin user
        logout();

        // Login to architect user
        architect.login();

        // Perform application review
        application.perform_review("medium");
        cy.wait(2000);
        application.verifyStatus("review", "Completed");

        // Logout from architect user
        architect.logout();
    });

    it("Architect, Disable review without assessment", function () {
        // Disable allow reviewing applications without running an assessment first button
        generalConfig.disableReviewAssessment();

        // Logout from admin user
        logout();

        // Login to architect user
        architect.login();

        // Verify review button is disabled for the application
        application.verifyReviewButtonDisabled();

        // Delete application
        application.delete();
        cy.wait(2000);

        // Logout from architect user
        architect.logout();
    });

    after("Clear test data", () => {
        if (hasToBeSkipped("@tier2")) return;
        login();
        User.loginKeycloakAdmin();
        architect.delete();
    });
});
