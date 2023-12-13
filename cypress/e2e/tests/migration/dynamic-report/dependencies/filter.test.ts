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
    clearAllFilters,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { dependencyFilter, SEC } from "../../../../types/constants";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import * as data from "../../../../../utils/data_utils";
import { Dependencies } from "../../../../models/migration/dynamic-report/dependencies/dependencies";
import { AppDependency } from "../../../../types/types";
import { randomWordGenerator } from "../../../../../utils/data_utils";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Tag } from "../../../../models/migration/controls/tags";

let applicationsList: Array<Analysis> = [];
let businessService: BusinessServices;
let archetype: Archetype;
let stakeholders: Stakeholders[];
let stakeholderGroups: Stakeholdergroups[];
let tags: Tag[];
let tagNames: string[];

describe(["@tier2"], "Dependency filtering", () => {
    before("Login", function () {
        login();
        businessService = new BusinessServices(data.getCompanyName(), data.getDescription());
        businessService.create();
        stakeholders = createMultipleStakeholders(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
        tags = createMultipleTags(2);
        tagNames = tags.map((tag) => tag.name);
        archetype = new Archetype(
            data.getRandomWord(8),
            [tagNames[0]],
            [tagNames[1]],
            null,
            stakeholders,
            stakeholderGroups
        );
        archetype.create();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Running analysis and filtering dependencies by app name", function () {
        const application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.business = businessService.name;
        application.create();
        applicationsList.push(application);
        cy.wait(2 * SEC);
        application.analyze();
        application.verifyAnalysisStatus("Completed");

        Dependencies.applyFilter(dependencyFilter.appName, application.name);
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.validateFilter(dependency);
            }
        );
        clearAllFilters();

        // Negative test, filtering by not existing data
        Dependencies.applyFilter(dependencyFilter.appName, randomWordGenerator(6));
        cy.get("tr").should("contain", "No data available");
        clearAllFilters();
    });

    it("Filtering dependencies by Archetype", function () {
        Dependencies.applyFilter(dependencyFilter.archetype, archetype.name);
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.validateFilter(dependency);
            }
        );
        clearAllFilters();
    });

    it("Filtering dependencies by BS", function () {
        Dependencies.applyFilter(dependencyFilter.bs, businessService.name);
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.validateFilter(dependency);
            }
        );
        clearAllFilters();
    });

    it("Filtering dependencies by tags", function () {
        this.analysisData["source_analysis_on_bookserverapp"]["tags"].forEach(
            (currentTag: string) => {
                Dependencies.applyFilter(dependencyFilter.tags, currentTag);
                this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
                    (dependency: AppDependency) => {
                        Dependencies.validateFilter(dependency);
                    }
                );
                clearAllFilters();
            }
        );
    });

    it("Filtering dependencies by dependency name", function () {
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.applyFilter(dependencyFilter.deppName, dependency.name);
                Dependencies.validateFilter(dependency);
                clearAllFilters();
            }
        );

        // Negative test, filtering by not existing data
        Dependencies.applyFilter(dependencyFilter.deppName, randomWordGenerator(6));
        cy.get("tr").should("contain", "No data available");
        clearAllFilters();
    });

    it("Filtering dependencies by dependency language", function () {
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.applyFilter(dependencyFilter.language, dependency.language);
                Dependencies.validateFilter(dependency);
                clearAllFilters();
            }
        );

        // Negative test, filtering by not existing data
        Dependencies.applyFilter(dependencyFilter.language, randomWordGenerator(6));
        cy.get("tr").should("contain", "No data available");
        clearAllFilters();
    });

    after("Perform test data clean up", function () {
        archetype.delete();
        deleteByList(applicationsList);
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
        businessService.delete();
    });
});
