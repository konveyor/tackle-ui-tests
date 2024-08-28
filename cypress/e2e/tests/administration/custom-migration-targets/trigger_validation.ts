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
    click,
    clickByText,
    closeSuccessAlert,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    next,
    selectItemsPerPage,
} from "../../../../utils/utils";
import {
    AnalysisStatuses,
    analyzeButton,
    button,
    CredentialType,
    Languages,
    SEC,
    UserCredentials,
} from "../../../types/constants";
import * as data from "../../../../utils/data_utils";
import { CustomMigrationTarget } from "../../../models/administration/custom-migration-targets/custom-migration-target";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { getRulesData } from "../../../../utils/data_utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
import { cancelButton } from "../../../views/common.view";
import * as commonView from "../../../views/common.view";
import { RulesRepositoryFields } from "../../../types/types";
import { Application } from "../../../models/migration/applicationinventory/application";

// Automates Bug MTA-3330
describe(["@tier2"], "Custom Migration Targets rules trigger validation", () => {
    let target: CustomMigrationTarget;
    const applications: Analysis[] = [];
    const EXPECTED_EFFORT = 5;

    before("Login", function () {
        login();
    });

    beforeEach("Fixtures and Interceptors", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });

        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.fixture("custom-rules").then(function (customMigrationTargets) {
            this.customMigrationTargets = customMigrationTargets;
        });

        CustomMigrationTarget.open(true);
    });

    it("Test same rules are triggered for custom rules and custom migiration target", function () {
        const targetData = this.customMigrationTargets[`rules_from_bug_3330`];
        target = new CustomMigrationTarget(
            data.getRandomWord(8),
            data.getDescription(),
            targetData.image,
            getRulesData(targetData),
            Languages.Java
        );
        target.create();

        for (let i = 0; i < 2; i++) {
            const application = new Analysis(
                getRandomApplicationData("Tackle Public", {
                    sourceData: this.appData["tackle-testapp-public"],
                }),
                {
                    source: "Source code",
                    target: [],
                }
            );
            application.create();
            applications.push(application);
        }

        applications[0].target = [target.name];
        applications[1].customRuleRepository = getRulesData(targetData) as RulesRepositoryFields;

        applications[0].analyze();
        applications[0].selectApplication();
        applications[1].analyze();

        applications.forEach((app) => {
            app.verifyAnalysisStatus(AnalysisStatuses.completed);
            app.verifyEffort(EXPECTED_EFFORT);
        });
    });

    after("Test", function () {
        Application.open(true);
        target.delete();
        applications.forEach((app) => app.delete());
    });
});
