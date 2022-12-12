import { hasToBeSkipped, login } from "../../../../utils/utils";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { Credentials } from "../../../models/administrator/credentials/credentials";

describe("Credentials fields validations", { tags: "@tier2" }, function () {
    const cred = new CredentialsSourceControlUsername(
        getRandomCredentialsData(CredentialType.proxy)
    );
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
    });
    it("Validate fields for too short (2 symbols) and too long (120+ symbols) length ", () => {
        Credentials.validateFields();
    });
});
