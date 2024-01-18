import { Analysis } from "../../../../../models/migration/applicationinventory/analysis";
import {
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateSortBy,
} from "../../../../../../utils/utils";
import { SEC } from "../../../../../types/constants";
import { Issues } from "../../../../../models/migration/dynamic-report/issues/issues";

describe(["@tier2"], "Issues sort validations", function () {
    let application: Analysis;

    before("Load data, create Analysis instance and run analysis", function () {
        login();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("BUG MTA-2067 - Source Analysis on daytrader app and its issues sorting validation", function () {
        // Create Analysis instance in before hook
        application = new Analysis(
            getRandomApplicationData("daytrader-app", {
                sourceData: this.appData["daytrader-app"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
        );
        application.create();
        cy.wait("@getApplication");
        application.analyze();
        cy.wait(2 * SEC);
        application.verifyAnalysisStatus("Completed");
        Issues.openList();
        validateSortBy("Issue");
    });

    it("Sort issues by category", function () {
        Issues.openList();
        validateSortBy("Category");
    });

    it("Sort issues by effort", function () {
        Issues.openList();
        validateSortBy("Effort");
    });

    it("Sort issues by affected applications", function () {
        Issues.openList();
        validateSortBy("Affected applications");
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        application.delete();
    });
});
