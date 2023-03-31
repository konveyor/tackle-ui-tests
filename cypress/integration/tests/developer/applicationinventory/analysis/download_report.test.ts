import {
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../../utils/utils";
import { GeneralConfig } from "../../../../models/administrator/general/generalConfig";
import { Analysis } from "../../../../models/developer/applicationinventory/analysis";
import { SEC } from "../../../../types/constants";

describe("Enable and Download HTML and CSV Reports", { tags: "@tier1" }, function () {
    let sourceApplication: Analysis;
    let generalConfig = GeneralConfig.getInstance();

    before("Login and enable download of HTML and CSV reports", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        login();

        // Enable HTML anc CSV report downloading
        generalConfig.enableDownloadHtml();
        generalConfig.enableDownloadCsv();
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
    });

    it("Download HTML and CSV Reports - Source App", function () {
        sourceApplication = new Analysis(
            getRandomApplicationData("SourceApp", {
                sourceData: this.appData[0],
            }),
            getRandomAnalysisData(this.analysisData[0])
        );
        sourceApplication.create();
        // applicationList.push(sourceApplication);
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
        if (hasToBeSkipped("@tier1")) return;
        sourceApplication.delete();
    });
});
