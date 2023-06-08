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
    login,
    logout,
    resetURL,
    writeGpgKey,
} from "../../../utils/utils";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { SEC } from "../../types/constants";
import { UserArchitect } from "../../models/keycloak/users/userArchitect";
import { getRandomUserData } from "../../../utils/data_utils";
import { User } from "../../models/keycloak/users/user";

describe(["@tier3"], "Upload Binary Analysis as an Architect", () => {
    let userArchitect = new UserArchitect(getRandomUserData());

    before("Login", function () {
        User.loginKeycloakAdmin();
        userArchitect.create();
        // Perform login as admin user to be able to create all required instances
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        deleteApplicationTableRows();
    });

    it("Upload Binary Analysis", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData[4])
        );
        application.create();
        cy.wait(2 * SEC);
        // Need to log out as admin and login as Architect to perform analysis
        logout();
        userArchitect.login();

        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("Custom rules with custom targets", function () {
        // Automated https://issues.redhat.com/browse/TACKLE-561
        const application = new Analysis(
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(this.analysisData[5])
        );
        application.create();
        cy.wait(2 * SEC);
        // Need to log out as admin and login as Architect to perform analysis
        logout();
        userArchitect.login();

        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
    });

    it("DIVA report generation", function () {
        const application = new Analysis(
            getRandomApplicationData("DIVA"),
            getRandomAnalysisData(this.analysisData[7])
        );
        application.create();
        cy.wait(2 * SEC);
        // Need to log out as admin and login as Architect to perform analysis
        logout();
        userArchitect.login();

        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        application.validateStoryPoints();
        application.validateTransactionReport();
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        writeGpgKey("abcde");
        logout();
        User.loginKeycloakAdmin();
        userArchitect.delete();
    });
});
