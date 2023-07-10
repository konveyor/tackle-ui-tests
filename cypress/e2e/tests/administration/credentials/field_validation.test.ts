import { login } from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administration/credentials/credentialsProxy";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";

describe(["@tier2"], "Credentials fields validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();
    });

    it("Validate Proxy credential's fields for too short (2 symbols) and too long (120+ symbols) length ", () => {
        CredentialsProxy.validateFields();
    });

    it("Validate Source control credential's fields for too short (2 symbols) and too long (120+ symbols) length ", () => {
        CredentialsSourceControlUsername.validateFields();
    });
});
