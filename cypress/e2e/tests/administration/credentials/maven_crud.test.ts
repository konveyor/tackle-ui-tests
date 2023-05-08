import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsMaven } from "../../../models/administration/credentials/credentialsMaven";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe(["@tier2"], "Validation of Source Control Credentials", () => {
    const mavenCredentialsUsername = new CredentialsMaven(
        getRandomCredentialsData(CredentialType.maven)
    );
    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Creating Maven credentials", () => {
        mavenCredentialsUsername.create();
    });

    after("Cleaning up", () => {
        login();
        mavenCredentialsUsername.delete();
    });
});
