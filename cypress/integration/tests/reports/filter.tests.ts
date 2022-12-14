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
    login,
    hasToBeSkipped,
    preservecookies,
    deleteApplicationTableRows,
    getRandomApplicationData,
    getRandomAnalysisData,
    resetURL,
} from "../../../utils/utils";
import { Analysis } from "../../models/developer/applicationinventory/analysis";
import { Report } from "../../models/developer/applicationinventory/reportPage";
import { analysis, name, tag } from "../../types/constants";
import { clearAllFilters } from "../../views/reportPage.view";

describe("Report Page Filter Validation", { tags: "@tier2" }, () => {
    const report = new Report();
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        deleteApplicationTableRows();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        deleteApplicationTableRows();
    });

    it("Filter Name validation test using Upload Binary Analysis", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData[9])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();

        // Enter an existing display name substring and assert appName0 exist
        report.applyFilter(name, application.appName[0].substring(0, 5));
        cy.get("[role=main]").should("contain.text", application.appName[0]);
        cy.get(clearAllFilters).click();
        // Enter an existing display exact name and assert appName1 exist
        report.applyFilter(name, application.appName[1]);
        cy.get("[role=main]").should("contain.text", application.appName[1]);
        cy.get(clearAllFilters).click();

        // Enter a non-existing Name and apply it as search filter
        // Assert that no search results are found
        let invalidSearchInput = "SomeInvalidInput";
        report.applyFilter(name, invalidSearchInput);
        cy.get("[role=main]").should("not.contain.text", application.appName);
        cy.get(clearAllFilters).click();
    });

    it("Tag Name validation test using Upload Binary Analysis", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData[9])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();

        // Enter an existing Tag and assert appName"acmeair-webapp-1.0-SNAPSHOT.war" is displayed
        report.applyFilter(tag, "web xml");
        cy.get("[role=main]").should("contain.text", application.appName[0]);
        cy.get(clearAllFilters).click();

        // Enter an existing Tag and assert appName "customers-tomcat-0.0.1-SNAPSHOT.war" is displayed
        report.applyFilter(tag, "tomcat");
        cy.get("[role=main]").should("contain.text", application.appName[1]);
        cy.get(clearAllFilters).click();

        // Enter a non-existing tag and apply it as search filter
        // Assert that no search results are found
        let invalidSearchInput = "SomeInvalidInput0";
        report.applyFilter(tag, invalidSearchInput);
        cy.get("[role=main]").should("not.contain.text", application.appName);
        cy.get(clearAllFilters).click();
    });
});
