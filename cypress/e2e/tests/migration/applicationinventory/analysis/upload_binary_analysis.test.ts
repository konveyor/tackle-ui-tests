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
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { AnalysisStatuses } from "../../../../types/constants";

const applicationsList: Analysis[] = [];
describe(["@tier2"], "Upload Binary Analysis", () => {
    before("Login", function () {
        login();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");

        Application.open(true);
    });

    it(["@interop", "@tier1"], "Analysis for acmeair app upload binary", function () {
        const application = new Analysis(
            getRandomApplicationData("acmeair_app"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);

        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
        Application.open(true);
        application.verifyEffort(this.analysisData["uploadbinary_analysis_on_acmeair"]["effort"]);
    });

    it(["@tier1"], "Custom rules with custom targets", function () {
        // Automated https://issues.redhat.com/browse/TACKLE-561
        const application = new Analysis(
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_with_customrule"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
        Application.open(true);
        application.verifyEffort(
            this.analysisData["uploadbinary_analysis_with_customrule"]["effort"]
        );
    });

    it("Analysis for spring-petclinic application", function () {
        const application = new Analysis(
            getRandomApplicationData("spring"),
            getRandomAnalysisData(this.analysisData["analysis_for_spring_petclinic_app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    it("Analysis for jee-example-app upload binary ", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(
                this.analysisData["analysis_and_incident_validation_jeeExample_app"]
            )
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        Application.open(true);
        application.verifyEffort(
            this.analysisData["analysis_and_incident_validation_jeeExample_app"]["effort"]
        );
    });

    it("Analysis for camunda-bpm-spring-boot-starter", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["analysis_and_incident_validation_camunda_app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        Application.open(true);
        application.verifyEffort(
            this.analysisData["analysis_and_incident_validation_camunda_app"]["effort"]
        );
    });

    it("Analysis for kafka-clients-sb app ", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["analysis_and_incident_validation_kafka-app"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
        Application.open(true);
        application.verifyEffort(
            this.analysisData["analysis_and_incident_validation_kafka-app"]["effort"]
        );
    });

    it("upload_binary_with_exculde_packages_scope", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["upload_binary_with_exculde_packages"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus(AnalysisStatuses.completed);
    });

    afterEach("Persist session", function () {
        Application.open(true);
    });

    after("Perform test data clean up", function () {
        deleteByList(applicationsList);
    });
});
