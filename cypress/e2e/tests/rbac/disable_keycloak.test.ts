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

import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { Application } from "../../models/migration/applicationinventory/application";
import { Assessment } from "../../models/migration/applicationinventory/assessment";
import * as data from "../../../utils/data_utils";
import { getRandomApplicationData, login, patchTackleCR } from "../../../utils/utils";
let application = new Assessment(getRandomApplicationData());

describe(["@tier2"], "Perform certain operations after disabling Keycloak", function () {
    before("Disable Keycloak", function () {
        login();
        patchTackleCR("keycloak", false);
        application.create();
    });

    beforeEach("Persist session", function () {
        // RBAC rules for architect are applicable to admin as well
        cy.fixture("rbac").then(function (rbacRules) {
            this.rbacRules = rbacRules["architect"];
        });
    });

    it("Auth disabled, Verify presence of Assess application button", function () {
        Application.validateAssessButton(this.rbacRules);
    });

    it("Auth disabled, Verify presence of Review application button", function () {
        Application.validateReviewButton(this.rbacRules);
    });

    it("Auth disabled, verify presence of import and manage imports", function () {
        Analysis.validateTopActionMenu(this.rbacRules);
    });

    it("Auth disabled, verify  presence of analyse button", function () {
        Analysis.validateAnalyzeButton(this.rbacRules);
    });

    it("Auth disabled, verify presence of analysis details and cancel analysis buttons", function () {
        application.validateAnalysisAvailableActions(this.rbacRules);
    });

    it("Architect, validate assessment context menu buttons presence", function () {
        application.validateAssessmentAvailableOptions(this.rbacRules);
    });

    it("Architect, validate availability of binary upload functionality", function () {
        application.validateUploadBinary(this.rbacRules);
    });

    after("Re-enable Keycloak", function () {
        // patchTackleCR("keycloak", true);
        application.delete();
    });
});
