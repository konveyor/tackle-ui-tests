import { hasToBeSkipped, login } from "../../../../utils/utils";
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
        
        login();
    });

    it("Creating Maven credentials", () => {
        mavenCredentialsUsername.create();
    });

    after("Cleaning up", () => {
        login();
        mavenCredentialsUsername.delete();
    });
});
