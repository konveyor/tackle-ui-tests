import { getRandomAnalysisData, getRandomApplicationData, login } from "../../../../../utils/utils";
import { GeneralConfig } from "../../../../models/administration/general/generalConfig";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { SEC } from "../../../../types/constants";

describe(["@tier2"], "Enable and Download HTML and CSV Reports", function () {
    let sourceApplication: Analysis;
    let generalConfig = GeneralConfig.getInstance();

    before("Login and enable download of HTML and CSV reports", function () {
        login();

        // Enable HTML anc CSV report downloading
        generalConfig.enableDownloadHtml();
        generalConfig.enableDownloadCsv();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Bug MTA-845 | Download HTML and CSV Reports - Source App", function () {
        sourceApplication = new Analysis(
            getRandomApplicationData("SourceApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        sourceApplication.create();
        cy.wait(2 * SEC);
        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus("Completed");
        sourceApplication.downloadReport("HTML");
        sourceApplication.downloadReport("CSV");
    });

    it("Disable HTML/CSV reports and validate they are disabled", function () {
        // Disabling download of HTML and CSV reports
        generalConfig.disableDownloadHtml();
        generalConfig.disableDownloadCsv();

        // Validating that existing reports do not have HTML/CSV links anymore
        sourceApplication.downloadReport("HTML", false);
        sourceApplication.downloadReport("CSV", false);
    });

    after("Cleaning up", function () {
        sourceApplication.delete();
    });
});
