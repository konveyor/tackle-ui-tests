import {
    createMultipleCredentials,
    deleteAllCredentials,
    hasToBeSkipped,
    login,
    validatePagination,
} from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administration/credentials/credentialsProxy";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { CredentialsMaven } from "../../../models/administration/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../models/administration/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../../../models/administration/credentials/credentialsSourceControlKey";
import { Credentials } from "../../../models/administration/credentials/credentials";

describe("Tag type pagination validations", { tags: "@tier3" }, function () {
    // let newCredentialsList: Array<Credentials> = [];
    let createdCredentialsList: Array<Credentials> = [];
    before("Login and Create Test Data", () => {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        deleteAllCredentials();
        // Create 12 extra credentials, 3 of each type
        createdCredentialsList = createMultipleCredentials(12);
    });

    it("Navigation button validations", function () {
        // select 10 items per page
        Credentials.openList(10);

        // Run validation
        validatePagination();
    });

    after("Removing credentials, created earlier", () => {
        if (hasToBeSkipped("@tier3")) return;
        deleteAllCredentials();
    });
});
