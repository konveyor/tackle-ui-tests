import {
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../utils/utils";
import { CredentialsMaven } from "../../../models/administrator/credentials/credentialsMaven";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { Analysis } from "../../../models/developer/applicationinventory/analysis";
import * as data from "../../../../utils/data_utils";
let mavenCredentialsUsername: CredentialsMaven;
let application: Analysis;

describe("Validation of Maven Credentials", () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        mavenCredentialsUsername = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, "None", true)
        );
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
    });

    it("Creating Maven credentials", () => {
        mavenCredentialsUsername.create();
    });

    it.skip("Editing Maven credentials", () => {
        mavenCredentialsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl));
    });

    it("Adding Maven credential to an application and running analysis", function () {
        application = new Analysis(
            getRandomApplicationData("bookserverApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        application.create();
        application.manageCredentials("None", mavenCredentialsUsername.name);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
    });

    after("Cleaning up", () => {
        if (hasToBeSkipped("@tier1")) return;
        mavenCredentialsUsername.delete();
        application.delete();
    });
});
