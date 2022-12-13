import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administrator/credentials/credentialsProxy";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";

describe("Credentials fields validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Validate Proxy credential's fields for too short (2 symbols) and too long (120+ symbols) length ", () => {
        CredentialsProxy.validateFields();
    });

    it("Validate Source control credential's fields for too short (2 symbols) and too long (120+ symbols) length ", () => {
        CredentialsSourceControlUsername.validateFields();
    });
});
