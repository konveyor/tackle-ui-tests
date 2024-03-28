import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import {
    clickWithinByText,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    selectItemsPerPage,
} from "../../../../../utils/utils";
import { rightSideMenu } from "../../../../views/analysis.view";
import { AnalysisStatuses, button } from "../../../../types/constants";
import { AppDependency } from "../../../../types/types";
import { Dependencies } from "../../../../models/migration/dynamic-report/dependencies/dependencies";

describe(["@tier3"], "Testing dependencies bugs", function () {
    let applicationsList: Array<Analysis> = [];

    before("Login and prerequisites", function () {
        login();

        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                const bookServerApp = new Analysis(
                    getRandomApplicationData("mta_2008_book_server_", {
                        sourceData: appData["bookserver-app"],
                    }),
                    getRandomAnalysisData(analysisData["analysis_for_openSourceLibraries"])
                );
                applicationsList.push(bookServerApp);
            });
        });
        cy.fixture("application").then((appData) => {
            cy.fixture("analysis").then((analysisData) => {
                const dayTraderApp = new Analysis(
                    getRandomApplicationData("mta_2008_daytrader_", {
                        sourceData: appData["daytrader-app"],
                    }),
                    getRandomAnalysisData(analysisData["source+dep_analysis_on_daytrader-app"])
                );
                applicationsList.push(dayTraderApp);

                applicationsList.forEach((application) => application.create());
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

    it("Validate dependencies filter is applied when drilling down from application page", function () {
        // Validation of bug https://issues.redhat.com/browse/MTA-2008
        const application = applicationsList[0];
        Analysis.analyzeAll(application);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);
        application.applicationDetailsTab("Details");
        clickWithinByText(rightSideMenu, "a", "Dependencies");
        selectItemsPerPage(100);
        cy.contains('[id^="pf-random-id-"]', application.name);
        cy.contains(button, "Clear all filters");
        this.analysisData["source_analysis_on_bookserverapp"]["dependencies"].forEach(
            (dependency: AppDependency) => {
                Dependencies.validateFilter(dependency);
            }
        );
    });

    after("Cleanup", function () {
        deleteByList(applicationsList);
    });
});
