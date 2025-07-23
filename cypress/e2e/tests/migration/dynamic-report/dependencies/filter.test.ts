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

import * as data from "../../../../../utils/data_utils";
import { randomWordGenerator } from "../../../../../utils/data_utils";
import {
    clearAllFilters,
    clickWithinByText,
    createMultipleBusinessServices,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    selectItemsPerPage,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Tag } from "../../../../models/migration/controls/tags";
import { Dependencies } from "../../../../models/migration/dynamic-report/dependencies/dependencies";
import { button, dependencyFilter, trTag } from "../../../../types/constants";
import { AppDependency } from "../../../../types/types";
import { rightSideMenu } from "../../../../views/analysis.view";

let applicationsList: Array<Analysis> = [];
let businessServiceList: BusinessServices[];
let archetype: Archetype;
let stakeholders: Stakeholders[];
let stakeholderGroups: Stakeholdergroups[];
let tags: Tag[];
let tagNames: string[];
let bookServerApp: Analysis;
let dayTraderApp: Analysis;

describe(["@tier3"], "Bug MTA-4598: Dependency filtering", () => {
    before("Login", function () {
        login();
        cy.visit("/");
        businessServiceList = createMultipleBusinessServices(2);
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

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                bookServerApp = new Analysis(
                    getRandomApplicationData("DepFilteringBookServer_", {
                        sourceData: appData["bookserver-app"],
                    }),
                    getRandomAnalysisData(analysisData["analysis_for_openSourceLibraries"])
                );
                bookServerApp.tags = tagNames;
                bookServerApp.business = businessServiceList[0].name;
                applicationsList.push(bookServerApp);
            });
        });
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                dayTraderApp = new Analysis(
                    getRandomApplicationData("DepFilteringDayTrader_", {
                        sourceData: appData["daytrader-app"],
                    }),
                    getRandomAnalysisData(analysisData["source+dep_analysis_on_daytrader-app"])
                );
                dayTraderApp.business = businessServiceList[1].name;
                applicationsList.push(dayTraderApp);

                applicationsList.forEach((application) => {
                    application.create();
                    application.analyze();
                    application.verifyAnalysisStatus("Completed");
                });
            });
        });
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Bug MTA-4598: Running analysis and filtering dependencies by app name", function () {
        Dependencies.openList(100);
        // Applying filter by book server app and validating no dependencies of day trader app showed up
        Dependencies.applyAndValidateFilter(
            dependencyFilter.appName,
            [bookServerApp.name],
            this.analysisData["source_analysis_on_bookserverapp"]["dependencies"],
            this.analysisData["source+dep_analysis_on_daytrader-app"]["dependencies"]
        );
        clearAllFilters();

        // Applying filter by day trader app and validating no dependencies of book server app showed up
        Dependencies.applyAndValidateFilter(
            dependencyFilter.appName,
            [dayTraderApp.name],
            this.analysisData["source+dep_analysis_on_daytrader-app"]["dependencies"],
            this.analysisData["source_analysis_on_bookserverapp"]["dependencies"]
        );
        clearAllFilters();
    });

    it("Bug MTA-4598: Filtering dependencies by Archetype", function () {
        Dependencies.applyFilter(dependencyFilter.archetype, archetype.name);
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.validateFilter(dependency);
            }
        );
        clearAllFilters();
    });

    it("Bug MTA-4598: Filtering dependencies by BS", function () {
        Dependencies.applyFilter(dependencyFilter.bs, businessServiceList[0].name);
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.validateFilter(dependency);
            }
        );
        clearAllFilters();
    });

    it("Bug MTA-4598: Filtering dependencies by tags", function () {
        tagNames.forEach((currentTag: string) => {
            Dependencies.applyFilter(dependencyFilter.tags, currentTag);
            this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
                (dependency: AppDependency) => {
                    Dependencies.validateFilter(dependency);
                }
            );
            clearAllFilters();
        });
    });

    it("Bug MTA-4598: Filtering dependencies by dependency name", function () {
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

    it("Bug MTA-4598: Filtering dependencies by dependency language", function () {
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.applyFilter(dependencyFilter.language, dependency.language);
                Dependencies.validateFilter(dependency);
                clearAllFilters();
            }
        );

        // Negative test, filtering by not existing data
        Dependencies.applyFilter(dependencyFilter.language, randomWordGenerator(6));
        cy.get(trTag).should("contain", "No data available");
        clearAllFilters();
    });

    it("Bug MTA-4598: Validate dependencies filter is applied when drilling down from application page", function () {
        // Validation of bug https://issues.redhat.com/browse/MTA-2008
        Analysis.open();
        bookServerApp.applicationDetailsTab("Details");
        clickWithinByText(rightSideMenu, "a", "Dependencies");
        selectItemsPerPage(100);
        cy.contains('[id^="pf-random-id-"]', bookServerApp.name);
        cy.contains(button, "Clear all filters");
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.validateFilter(dependency);
            }
        );
    });

    after("Perform test data clean up", function () {
        archetype.delete();
        deleteByList(applicationsList);
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
        deleteByList(businessServiceList);
    });
});
