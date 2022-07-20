import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsMaven } from "../../../models/administrator/credentials/credentialsMaven";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe("Validation of Source Control Credentials", () => {
    const mavenCredsUsername = new CredentialsMaven(getRandomCredentialsData(CredentialType.maven));
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
        mavenCredsUsername.create();
    });

    it.skip("Editing Maven credentials", () => {
        mavenCredsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl));
    });

    after("Cleaning up", () => {
        mavenCredsUsername.delete();
    });
});
