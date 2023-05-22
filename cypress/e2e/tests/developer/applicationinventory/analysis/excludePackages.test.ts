import {
    login,
    hasToBeSkipped,
    preservecookies,
    deleteApplicationTableRows,
    getRandomApplicationData,
    getRandomAnalysisData,
    resetURL,
    deleteAllCredentials,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/developer/applicationinventory/analysis";
import { analysis, CredentialType, UserCredentials } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { CredentialsSourceControlUsername } from "../../../../models/administrator/credentials/credentialsSourceControlUsername";
let source_credential;

describe(["@tier2"], "Source Analysis", () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        // Delete existing pre-data
        deleteApplicationTableRows();

        // Create source Credentials
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();
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

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    it("Exclude a package in analysis", function () {
        // For source code analysis application must have source code URL git or svn
        const application = new Analysis(
            getRandomApplicationData("testapp-excludePackages", { sourceData: this.appData[3] }),
            getRandomAnalysisData(this.analysisData[8])
        );
        application.create();
        application.manageCredentials(source_credential.name);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
        // Customer package is provided in excludePackage option in analysis
        // and report should exclude customer package in analysis .
        application.validateExcludedPackages("Customer");
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier2")) return;
        // Prevent hook from running, if the tag is excluded from run
        deleteApplicationTableRows();
        deleteAllCredentials();
    });
});
