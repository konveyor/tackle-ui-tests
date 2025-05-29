import {
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    validateSortBy,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Dependencies } from "../../../../models/migration/dynamic-report/dependencies/dependencies";

describe(["@tier3"], "Bug MTA-4598: Dependencies sort validations", function () {
    let application: Analysis;
    const sortByList = ["Dependency name", "Labels", "Found in"];

    before("Load data", function () {
        login();
        cy.visit("/");
        cy.intercept("GET", "/hub/application*").as("getApplication");
        cy.fixture("application")
            .then(function (appData) {
                this.appData = appData;
            })
            .then(function () {
                cy.fixture("analysis").then(function (analysisData) {
                    this.analysisData = analysisData;
                });
            })
            .then(function () {
                application = new Analysis(
                    getRandomApplicationData("daytrader-app", {
                        sourceData: this.appData["daytrader-app"],
                    }),
                    getRandomAnalysisData(this.analysisData["source+dep_analysis_on_daytrader-app"])
                );
                application.create();
                cy.wait("@getApplication");
                application.analyze();
                application.verifyAnalysisStatus("Completed");
            });
    });

    sortByList.forEach((column) => {
        it(`Bug MTA-4598: Sort dependencies by ${column}`, function () {
            Dependencies.openList();
            validateSortBy(column);
        });
    });

    after("Perform test data clean up", function () {
        Analysis.open(true);
        application.delete();
    });
});
