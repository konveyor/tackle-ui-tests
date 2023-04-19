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
    deleteAllBusinessServices,
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    logout,
    resetURL,
    writeGpgKey,
} from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { SEC } from "../../types/constants";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { getRandomUserData } from "../../../utils/data_utils";
import { User } from "../../models/keycloak/users/user";

describe("Upload Binary Analysis", { tags: "@tier3" }, () => {
    let userArchitect = new UserArchitect(getRandomUserData());
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

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
        deleteApplicationTableRows();
    });

    it("Upload Binary Analysis", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData[4])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        // Need to log out as admin and login as Architect to perform analysis
        logout();
        userArchitect.login();

        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
        application.validateStoryPoints();
        // userArchitect.logout();
    });

    it("Custom rules with custom targets", function () {
        // Automated https://issues.redhat.com/browse/TACKLE-561
        const application = new Analysis(
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(this.analysisData[5])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        // Need to log out as admin and login as Architect to perform analysis
        logout();
        userArchitect.login();

        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
        application.validateStoryPoints();
    });

    it("DIVA report generation", function () {
        const application = new Analysis(
            getRandomApplicationData("DIVA"),
            getRandomAnalysisData(this.analysisData[7])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2 * SEC);
        // Need to log out as admin and login as Architect to perform analysis
        logout();
        userArchitect.login();

        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
        application.validateStoryPoints();
        application.validateTransactionReport();
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier3")) return;
        // Prevent hook from running, if the tag is excluded from run
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        writeGpgKey("abcde");
        userArchitect.logout();
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
