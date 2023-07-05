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

describe.skip(["@tier2"], "Exclude Tags", () => {
    before("Login", function () {
        // Perform login
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

    afterEach("Persist session", function () {
        // Reset URL from report page to web UI
        resetURL();
    });

    it("Exclude Tags from report using source analysis", function () {
        // skipping until bug https://issues.redhat.com/browse/MTA-40 is fixed.
        // For source code analysis application must have source code URL git or svn
        application = new Analysis(
            getRandomApplicationData("testapp-excludePackages", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["analysis_for_excludeRuleTags"])
        );
        application.create();
        application.manageCredentials(source_credential.name);
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openReport();

        // Validate the report exclude Tags .
        // TC expected to fail due to bug https://issues.redhat.com/browse/MTA-40
        application.validateExcludedTags();
    });

    after("Perform test data clean up", function () {
        application.delete();
        source_credential.delete();
    });
});
