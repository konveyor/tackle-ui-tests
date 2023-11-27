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
import { getRandomApplicationData, login, patchTackleCR } from "../../../utils/utils";
import { Stakeholders } from "../../models/migration/controls/stakeholders";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
let application = new Assessment(getRandomApplicationData());
let stakeholder = new Stakeholders(data.getEmail(), data.getFullName());

describe(["@tier4"], "Perform certain operations after disabling Keycloak", function () {
    // Automates Polarion MTA-293
    before("Disable Keycloak", function () {
        login();
        // Skipping patching Tackle CR due to a bug MTA-1152
        // patchTackleCR("keycloak", false);

        stakeholder.create();
        application.create();
    });

    beforeEach("Load data", function () {
        // RBAC rules for architect are applicable to admin as well
        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["architect"];
        });
    });

    it.skip("Bug MTA-1152: Auth disabled, Perform application assessment", function () {
        application.perform_assessment("low", [stakeholder.name]);
        cy.wait(1000);
        application.verifyStatus("assessment", "Completed");
    });

    it.skip("Bug MTA-1152: Auth disabled, Verify presence of Review application button", function () {
        // Application.validateReviewButton(this.rbacRules);
    });

    after("Re-enable Keycloak", function () {
        // Skipping patching Tackle CR due to a bug MTA-1152
        // patchTackleCR("keycloak", true);
        login();

        application.delete();
        stakeholder.delete();
    });
});
