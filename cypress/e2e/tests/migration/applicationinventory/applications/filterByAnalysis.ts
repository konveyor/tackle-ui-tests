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
    exists,
    applySearchFilter,
    getRandomApplicationData,
    getRandomAnalysisData,
    checkSuccessAlert,
    createMultipleApplicationsWithBSandTags,
    createMultipleBusinessServices,
    createMultipleTags,
    login,
    clearAllFilters,
} from "../../../../../utils/utils";
import {
    button,
    analysis,
} from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Tag } from "../../../../models/migration/controls/tags";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import * as commonView from "../../../../views/common.view";
import { AppIssue } from "../../../../types/types";
import { analysisDetails } from "../../../../views/analysis.view";


let applicationsList: Array<Application> = [];
let businessServicesList: Array<BusinessServices> = [];
let tagList: Array<Tag> = [];
let application: Analysis;


const fileName = "Legacy Pathfinder";

describe(["@tier3"], "Application inventory filter validations", function () {
   
    before("Login", function () {
        login();
    });
    beforeEach("Load Fixtures & Interceptors", function () {
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        let businessServicesList = createMultipleBusinessServices(2);
        let tagList = createMultipleTags(2);

        applicationsList = createMultipleApplicationsWithBSandTags(
            2,
            businessServicesList,
            tagList,
            null
        );

        cy.intercept("GET", "/hub/application*").as("getApplication");
        Application.open(true);
    });

    beforeEach("Load data", function () {
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

    it("Source Analysis on bookserver app and its issues validation", function () {
    //     // For source code analysis application must have source code URL git or svn
        application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        applicationsList.push(application);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        checkSuccessAlert(commonView.infoAlertMessage, `Submitted for analysis`);
        application.verifyAnalysisStatus("Failed");
        application.validateIssues(this.analysisData["source_analysis_on_bookserverapp"]["issues"]);
        this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
            (currentIssue: AppIssue) => {
                application.validateAffected(currentIssue);
            }
        );
    });

    it("Source Analysis on bookserver app and its issues validation", function () {
        //     // For source code analysis application must have source code URL git or svn
            application = new Analysis(
                getRandomApplicationData("bookserverApp", {
                    sourceData: this.appData["bookserver-app"],
                }),
                getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
            );
            application.create();
            applicationsList.push(application);
            cy.wait("@getApplication");
            cy.wait(2000);
            application.analyze();
            checkSuccessAlert(commonView.infoAlertMessage, `Submitted for analysis`);
            application.verifyAnalysisStatus("Completed");
            application.validateIssues(this.analysisData["source_analysis_on_bookserverapp"]["issues"]);
            this.analysisData["source_analysis_on_bookserverapp"]["issues"].forEach(
                (currentIssue: AppIssue) => {
                    application.validateAffected(currentIssue);
                }
            );
        });

    it("Analysis filter validations", function () {
        Application.open();
            applySearchFilter(analysis,"Failed");
            exists("Failed");  
            clearAllFilters();
            applySearchFilter(analysis,"Not started");
            exists("Not started");  
            clearAllFilters();
            applySearchFilter(analysis,"Completed");
            exists("Completed"); 
           
            

    });
});



