import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../../../models/administrator/credentials/credentialsSourceControlKey";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe("Validation of Source Control Credentials", () => {
    const scCredsUsername = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.sourceControl)
    );
    const scCredsKey = new CredentialsSourceControlKey(
        getRandomCredentialsData(CredentialType.sourceControl)
    );

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Creating source control credentials with username/password", () => {
        scCredsUsername.create();
    });

    it("Editing source control credentials with username/password", () => {
        scCredsUsername.edit(getRandomCredentialsData(CredentialType.sourceControl));
    });

    it("Creating source control credentials with source private key", () => {
        scCredsKey.create();
    });

    it("Editing source control credentials with source private key", () => {
        scCredsKey.edit(getRandomCredentialsData(CredentialType.sourceControl));
    });

    after("Cleaning up", () => {
        scCredsUsername.delete();
        scCredsKey.delete();
    });
});
