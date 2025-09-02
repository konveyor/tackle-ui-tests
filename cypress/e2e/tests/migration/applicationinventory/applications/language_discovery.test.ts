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

import { languageDiscoveryData } from "../../../../../fixtures/language_discovery.json";
import { getRandomCredentialsData } from "../../../../../utils/data_utils";
import {
    deleteAppImportsTableRows,
    deleteApplicationTableRows,
    deleteByList,
    getRandomApplicationData,
    sidedrawerTab,
} from "../../../../../utils/utils";
import { Credentials } from "../../../../models/administration/credentials/credentials";
import { CredentialsMaven } from "../../../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { TaskManager } from "../../../../models/migration/task-manager/task-manager";
import {
    CredentialType,
    SEC,
    TaskKind,
    TaskStatus,
    UserCredentials,
} from "../../../../types/constants";
import { labelTagText } from "../../../../views/applicationinventory.view";

let applicationList: Application[] = [];
let credentialsList: Credentials[] = [];

describe(["@tier2"], "Test if application language is discovered and tagged correctly", () => {
    languageDiscoveryData.forEach((data) => {
        it(`test ${data.name.split("-").join(" ")}`, function () {
            // Automates TCs 582, 583, 584, 585, 585, 586, 587

            const sectionsTags = data.sections_tags;
            const application = new Application(
                getRandomApplicationData(data.name, {
                    sourceData: {
                        repoType: data.repoType,
                        sourceRepo: data.sourceRepo,
                    },
                })
            );
            application.create();
            applicationList.push(application);
            sidedrawerTab(data.name, "Tags");
            cy.contains("No tags available", { timeout: 60 * SEC }).should("not.exist");
            assertTagsInSection(sectionsTags);
        });
    });

    it("Verify application discovery logic for missing, and valid credentials", () => {
        // Automates TCs MTA-712

        const application = new Application(
            getRandomApplicationData("application discovery logic", {
                sourceData: {
                    repoType: "Git",
                    sourceRepo: "https://github.com/konveyor/tackle-testapp",
                },
            })
        );

        application.create();

        TaskManager.verifyTaskStatus(
            application.name,
            TaskKind.languageDiscovery,
            TaskStatus.failed
        );
        TaskManager.verifyTaskStatus(application.name, TaskKind.techDiscovery, TaskStatus.canceled);

        const defaultScCreds = new CredentialsSourceControlUsername(
            getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true,
                null,
                true
            )
        );
        credentialsList.push(defaultScCreds);
        defaultScCreds.create();
        defaultScCreds.verifyDefaultCredentialIcon();

        const mavenDefaultCred = new CredentialsMaven(
            getRandomCredentialsData(CredentialType.maven, null, false, null, true)
        );

        mavenDefaultCred.create();
        mavenDefaultCred.verifyDefaultCredentialIcon();
        credentialsList.push(mavenDefaultCred);

        TaskManager.verifyTaskStatus(
            application.name,
            TaskKind.languageDiscovery,
            TaskStatus.succeeded
        );
        TaskManager.verifyTaskStatus(
            application.name,
            TaskKind.techDiscovery,
            TaskStatus.succeeded
        );
    });

    afterEach("Persist session", function () {
        Application.open(true);
    });

    after("Perform test data clean up", function () {
        deleteApplicationTableRows();
        deleteAppImportsTableRows();
        deleteByList(credentialsList);
    });

    function assertTagsInSection(sectionsTags: {
        Language: string[];
        Tooling?: string[];
        Framework?: string[];
    }): void {
        Cypress._.forEach(sectionsTags, (tags, section) => {
            if (section) {
                cy.contains("h4", section)
                    .parentsUntil("section")
                    .next()
                    .within(() => {
                        tags.forEach((tag) => {
                            cy.contains(labelTagText, tag).should("have.length", 1);
                        });
                    });
            }
        });
    }
});
