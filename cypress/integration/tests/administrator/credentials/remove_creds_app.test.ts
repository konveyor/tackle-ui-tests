import {
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType, UserCredentials } from "../../../types/constants";
import { Analysis } from "../../../models/developer/applicationinventory/analysis";
let source_credential;
let application;

describe("Validation of Source Control Credentials", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

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
        preservecookies();
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
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        application.delete();
    });
});
