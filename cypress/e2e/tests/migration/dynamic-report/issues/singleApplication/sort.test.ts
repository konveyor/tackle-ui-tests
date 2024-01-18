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
    const sortByList = ["Issue", "Category", "Effort", "Affected files"];

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

    it("Source Analysis on daytrader application", function () {
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
    });

    sortByList.forEach((column) => {
        it(`${
            column == "Issue" ? "BUG MTA-2067 - " : ""
        }Sort single application issues by ${column}`, function () {
            Issues.openSingleApplication(application.name);
            validateSortBy(column);
        });
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        application.delete();
    });
});
