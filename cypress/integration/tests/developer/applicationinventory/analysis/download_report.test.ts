import {
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../../utils/utils";
import { ReportConfig } from "../../../../models/developer/reports/reportConfig";
import { Analysis } from "../../../../models/developer/applicationinventory/analysis";
import { CredentialType, SEC, UserCredentials } from "../../../../types/constants";
import { CredentialsMaven } from "../../../../models/administrator/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../../models/administrator/credentials/credentialsSourceControlUsername";
import * as data from "../../../../../utils/data_utils";
import { getRandomCredentialsData } from "../../../../../utils/data_utils";

describe("Enable and Download HTML and CSV Reports", { tags: "@tier1" }, function () {
    let mavenCredentials: CredentialsMaven;
    let sourceControlUsernameCredentials: CredentialsSourceControlUsername;
    let applicationList = [];
    let sourceApplication: Analysis;
    let binaryApplication: Analysis;
    let reportConfig = ReportConfig.getInstance();

    before("Login and enable download of HTML and CSV reports", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        login();

        // Enable HTML anc CSV report downloading
        reportConfig.enableDownloadHtml();
        reportConfig.enableDownloadCsv();

        // Creating credentials required for analysis
        sourceControlUsernameCredentials = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        sourceControlUsernameCredentials.create();

        mavenCredentials = new CredentialsMaven(
            getRandomCredentialsData(CredentialType.maven, "None", true)
        );
        mavenCredentials.create();
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

    it("Download HTML Reports - Source App", function () {
        sourceApplication = new Analysis(
            getRandomApplicationData("SourceApp", {
                sourceData: this.appData[0],
            }),
            getRandomAnalysisData(this.analysisData[0])
        );
        sourceApplication.create();
        applicationList.push(sourceApplication);
        cy.wait(2 * SEC);
        sourceApplication.analyze();
        sourceApplication.verifyAnalysisStatus("Completed");
        sourceApplication.downloadReport("HTML");
    });

    it("Download CSV Reports - Binary App", function () {
        // For binary analysis application must have group,artifact and version.
        binaryApplication = new Analysis(
            getRandomApplicationData("BinaryApp", {
                binaryData: this.appData[2],
            }),
            getRandomAnalysisData(this.analysisData[3])
        );
        binaryApplication.create();
        applicationList.push(binaryApplication);
        cy.wait(2 * SEC);
        // Both source and maven credentials required for binary.
        binaryApplication.manageCredentials(
            sourceControlUsernameCredentials.name,
            mavenCredentials.name
        );
        binaryApplication.analyze();
        binaryApplication.verifyAnalysisStatus("Completed");
        binaryApplication.downloadReport("CSV");
    });

    it("Disable HTML/CSV reports and validate they are disabled", function () {
        // Disabling download of HTML and CSV reports
        reportConfig.disableDownloadHtml();
        reportConfig.disableDownloadCsv();

        // Validating that existing reports do not have HTML/CSV links anymore
        sourceApplication.downloadReport("HTML", false);
        sourceApplication.downloadReport("CSV", false);
        binaryApplication.downloadReport("HTML", false);
        binaryApplication.downloadReport("CSV", false);
    });

    after("Cleaning up", function () {
        if (hasToBeSkipped("@tier1")) return;
        deleteByList(applicationList);
        sourceControlUsernameCredentials.delete();
        mavenCredentials.delete();
    });
});
