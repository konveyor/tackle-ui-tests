import {
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../utils/utils";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { Analysis } from "../../../models/developer/applicationinventory/analysis";
import { CredentialsMaven } from "../../../models/administrator/credentials/credentialsMaven";
let maven_credential: CredentialsMaven;
let application: Analysis;

describe("Validation of Source Control Credentials", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        maven_credential = new CredentialsMaven(getRandomCredentialsData(CredentialType.maven));

        maven_credential.create();
        maven_credential.inUse = true;
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
        application.manageCredentials(maven_credential);
        application.analyze();
    });

    after("Cleanup", () => {
        maven_credential.delete();
        application.delete();
    });
});
