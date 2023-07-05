import {
    login,
    getRandomApplicationData,
    getRandomAnalysisData,
    resetURL,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { CredentialType, UserCredentials } from "../../../../types/constants";
import * as data from "../../../../../utils/data_utils";
import { CredentialsSourceControlUsername } from "../../../../models/administration/credentials/credentialsSourceControlUsername";
let source_credential;
let application: Analysis;

describe(["@tier2"], "Source Analysis", () => {
    before("Login", function () {
        login();

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

    beforeEach("Load data", function () {
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
        application = new Analysis(
            getRandomApplicationData("testapp-excludePackages", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_exclude_packages"])
        );
        application.create();
        application.manageCredentials(source_credential.name);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();
        // Customer package is provided in excludePackage option in analysis
        // and report should exclude customer package in analysis .
        application.validateExcludedPackages("Customer");
    });

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    after("Perform test data clean up", function () {
        application.delete();
        source_credential.delete();
    });
});
