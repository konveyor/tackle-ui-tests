import {
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    preservecookies,
} from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";
let source_credential;
let application;

describe(["@tier1"], "Validation of Source Control Credentials", () => {
    before("Login", function () {
        // Perform login
        login();
        source_credential = new CredentialsSourceControlUsername(
            getRandomCredentialsData(CredentialType.sourceControl, UserCredentials.usernamePassword)
        );

        source_credential.create();
        source_credential.inUse = true;
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Deleting credential that is in use by one application", function () {
        application = new Analysis(
            getRandomApplicationData(),
            getRandomAnalysisData(this.analysisData)
        );
        application.create();
        application.manageCredentials(source_credential.name);
        source_credential.delete();
    });

    after("Cleanup", () => {
        application.delete();
    });
});
