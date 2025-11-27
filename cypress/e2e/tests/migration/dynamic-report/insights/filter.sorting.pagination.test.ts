import { getRandomAnalysisData, getRandomApplicationData, login } from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Insights } from "../../../../models/migration/dynamic-report/insights/insights";
import { AnalysisStatuses } from "../../../../types/constants";

describe(["@tier3"], "Filtering, sorting and pagination in Insights", function () {
    const applicationsList: Analysis[] = [];
    const appAmount = 1;
    before("Login", function () {
        Cypress.session.clearAllSavedSessions();
        login();
        cy.visit("/");

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < appAmount; i++) {
                    const bookServerApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp1_" + i, {
                            sourceData: appData["bookserver-app"],
                        }),
                        getRandomAnalysisData(analysisData["source_analysis_on_bookserverapp"])
                    );
                    // bookServerApp.business = businessServiceList[0].name;
                    applicationsList.push(bookServerApp);
                }
            });
        });

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                for (let i = 0; i < appAmount; i++) {
                    const coolstoreApp = new Analysis(
                        getRandomApplicationData("IssuesFilteringApp2_" + i, {
                            sourceData: appData["coolstore-app"],
                        }),
                        getRandomAnalysisData(analysisData["source+dep_on_coolStore_app"])
                    );
                    // coolstoreApp.tags = tagNames;
                    // coolstoreApp.business = businessServiceList[1].name;
                    applicationsList.push(coolstoreApp);
                }

                applicationsList.forEach((application) => application.create());
            });
        });
    });

    it("Test title", function () {
        // // Analyzing Coolstore app for pagination test to generate issues more than 10.
        // const bookServerApp = applicationsList[0];
        // const coolstoreApp = applicationsList[appAmount];
        // const bookServerIssues = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        // const coolstoreIssues = this.analysisData["source+dep_on_coolStore_app"]["issues"];

        Analysis.analyzeByList(applicationsList);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);

        Insights.openList();
    });
});
