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

import { getRandomUserData } from "../../../../utils/data_utils";
import {
    deleteApplicationTableRows,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../utils/utils";
import { User } from "../../../models/keycloak/users/user";
import { UserArchitect } from "../../../models/keycloak/users/userArchitect";
import { UserMigrator } from "../../../models/keycloak/users/userMigrator";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { TaskStatus } from "../../../types/constants";

describe(["@tier3"], "Cancel task created by another user", function () {
    let userMigrator = new UserMigrator(getRandomUserData());
    let userArchitect = new UserArchitect(getRandomUserData());
    let applicationsList: Array<Analysis> = [];

    before("Login", function () {
        login();
        cy.visit("/");
        deleteApplicationTableRows();
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < 3; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("bookserverApp", {
                            sourceData: appData["bookserver-app"],
                        }),
                        getRandomAnalysisData(analysisData["source_analysis_on_bookserverapp"])
                    );
                    applicationsList.push(bookServerApp);
                }
                applicationsList.forEach((application) => application.create());
            });
        });

        // Creating RBAC users
        User.loginKeycloakAdmin();
        userMigrator.create();
        userArchitect.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Bug MTA-3819: Run analysis by admin and cancel by another user - should not be allowed", function () {
        applicationsList[0].analyze();
        userMigrator.login();
        TaskManager.cancelAnalysisByStatus(applicationsList[0].name, TaskStatus.running, false);

        // TODO: (mguetta) uncomment the below once bug MTA-3819 is fixed.
        // userArchitect.login();
        // TaskManager.cancelAnalysisByStatus(app.name, TaskStatus.running, false);
        // userArchitect.logout();
    });

    it("Bug MTA-3819: Run analysis by migrator and cancel by architect user - should not be allowed", function () {
        userMigrator.login();
        applicationsList[1].analyze();
        userMigrator.logout();

        userArchitect.login();
        TaskManager.cancelAnalysisByStatus(applicationsList[1].name, TaskStatus.running, false);
    });

    it("Run analysis by architect and cancel by admin user - should be allowed", function () {
        userArchitect.login();
        applicationsList[2].analyze();
        userArchitect.logout();

        login();
        cy.visit("/");
        TaskManager.cancelAnalysisByStatus(applicationsList[2].name, TaskStatus.running);
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
    });
});
