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

import { getRandomUserData } from "../../../utils/data_utils";
import {
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../utils/utils";
import { User } from "../../models/keycloak/users/user";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { AnalysisStatuses, SEC } from "../../types/constants";

describe(["@tier3"], "Architect Upload Binary Analysis", () => {
    const userArchitect = new UserArchitect(getRandomUserData());
    const applications: Analysis[] = [];

    before("Login", function () {
        User.loginKeycloakAdmin();
        userArchitect.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");

        // Perform login as admin user to be able to create all required instances
        login();
        cy.visit("/");
    });

    it("Upload Binary Analysis", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );
        application.create();
        cy.wait("@getApplication");
        userArchitect.login();

        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    it("Custom rules with custom targets", function () {
        // Automated https://issues.redhat.com/browse/TACKLE-561
        const application = new Analysis(
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_with_customrule"])
        );
        application.create();
        applications.push(application);
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        userArchitect.login();

        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    after("Perform test data clean up", function () {
        deleteByList(applications);
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
