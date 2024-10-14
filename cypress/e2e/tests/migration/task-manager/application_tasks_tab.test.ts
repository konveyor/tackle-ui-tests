
/// <reference types="cypress" />
import {
    login,
    getRandomApplicationData,
    sidedrawerTab,
    deleteByList,
    getRandomAnalysisData,
} from "../../../../utils/utils";
import { Application } from "../../../../e2e/models/migration/applicationinventory/application";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
   
let applicationsList: Array<Analysis> = [];
let application: Analysis;

describe(["@tier2"], "Open Tasks Tab and Verify Tasks", () => {
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
        cy.intercept("GET", "/api/applications/*").as("getApplication");
    });
       
    it(`Open 'Tasks' tab in the application drawer and verify task kinds `, function () {
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
        application.verifyAnalysisStatus("Completed");
        
        sidedrawerTab(application.name, "Tasks");

        cy.get("[data-label='Task Kind']").should((tasks) => {
           const taskKinds = tasks.toArray().map(task => task.innerText);
            expect(taskKinds).to.include.members(["language-discovery", "tech-discovery", "analyzer"]);
            });

     });

       });
         afterEach("Persist session", function () {
            Application.open(true);
        });
    
        after("Perform test data clean up", function () {
            deleteByList(applicationsList);
        });
