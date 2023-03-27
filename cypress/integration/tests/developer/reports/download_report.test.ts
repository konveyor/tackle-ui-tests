import {
    cleanupDownloads,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../utils/utils";
import { ReportConfig } from "../../../models/developer/reports/reportConfig";
import { Analysis } from "../../../models/developer/applicationinventory/analysis";
import { CredentialType, SEC, UserCredentials } from "../../../types/constants";
import { CredentialsMaven } from "../../../models/administrator/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import * as data from "../../../../utils/data_utils";
import { getRandomCredentialsData } from "../../../../utils/data_utils";

describe(
    "This test set is enabling HTML/CSV reports download, run analysis of all possible types and downloads report generated for it",
    { tags: "@tier1" },
    function () {
        let mavenCredentials: CredentialsMaven;
        let sourceControlUsernameCredentials: CredentialsSourceControlUsername;
        let applicationList = [];

        before("Login and enable download of HTML and CSV reports", function () {
            // Prevent hook from running, if the tag is excluded from run
            if (hasToBeSkipped("@tier1")) return;

            login();

            // Enable HTML anc CSV report downloading
            let reportConfig = ReportConfig.getInstance();
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

        it("Creating source applications", function () {
            const sourceApplication = new Analysis(
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

        it("Creating Upload Binary Analysis", function () {
            const uploadBinaryApplication = new Analysis(
                getRandomApplicationData("UploadBinaryApp"),
                getRandomAnalysisData(this.analysisData[4])
            );
            uploadBinaryApplication.create();
            applicationList.push(uploadBinaryApplication);
            cy.wait(2 * SEC);
            // No credentials required for uploaded binary.
            uploadBinaryApplication.analyze();
            uploadBinaryApplication.verifyAnalysisStatus("Completed");
        });

        it("Binary Analysis", function () {
            // For binary analysis application must have group,artifact and version.
            const binaryApplication = new Analysis(
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
        });

        afterEach("Removing downloaded files after they were validated", function () {
            cleanupDownloads();
        });

        after("Cleaning up", function () {
            if (hasToBeSkipped("@tier1")) return;
            deleteByList(applicationList);
            sourceControlUsernameCredentials.delete();
            mavenCredentials.delete();
        });
    }
);
