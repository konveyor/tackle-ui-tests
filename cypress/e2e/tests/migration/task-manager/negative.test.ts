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
    logout,
} from "../../../../utils/utils";
import { User } from "../../../models/keycloak/users/user";
import { UserArchitect } from "../../../models/keycloak/users/userArchitect";
import { UserMigrator } from "../../../models/keycloak/users/userMigrator";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../models/migration/applicationinventory/application";
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { TaskKind, TaskStatus } from "../../../types/constants";

describe(["@tier3"], "Negative: cancel task created by another user", function () {
    let userMigrator = new UserMigrator(getRandomUserData());
    let userArchitect = new UserArchitect(getRandomUserData());
    let applicationsList: Array<Analysis> = [];

    before("Login", function () {
        // Creating RBAC users
        User.loginKeycloakAdmin();
        userMigrator.create();
        userArchitect.create();

        login();
        deleteApplicationTableRows();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Bug MTA-3819: Run analysis by admin and cancel by migrator user - should not be allowed", function () {
        let application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        application.analyze();

        userMigrator.login();
        TaskManager.cancelAnalysisByStatus(application.name, TaskStatus.running, false);

        logout();
        userArchitect.login();
        TaskManager.cancelAnalysisByStatus(application.name, TaskStatus.running, false);
    });
});
