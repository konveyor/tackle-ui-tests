import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsMaven } from "../../../models/administrator/credentials/credentialsMaven";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe("Validation of Source Control Credentials", () => {
    const mavenCredentialsUsername = new CredentialsMaven(
        getRandomCredentialsData(CredentialType.maven)
    );
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

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

    it.skip("Editing Maven credentials", () => {
        mavenCredentialsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl));
    });

    after("Cleaning up", () => {
        if (hasToBeSkipped("@tier2")) return;
        mavenCredentialsUsername.delete();
    });
});
