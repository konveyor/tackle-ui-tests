import { hasToBeSkipped, login, validatePagination } from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administrator/credentials/credentialsProxy";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { CredentialsMaven } from "../../../models/administrator/credentials/credentialsMaven";
import { CredentialsSourceControlUsername } from "../../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialsSourceControlKey } from "../../../models/administrator/credentials/credentialsSourceControlKey";
import { Credentials } from "../../../models/administrator/credentials/credentials";

describe("Tag type pagination validations", { tags: "@tier3" }, function () {
    let newCredentialsList = [];
    let createdCredentialsList = [];
    before("Login and Create Test Data", () => {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier3")) return;

        // Perform login
        login();
        Credentials.openList();
        // Create 12 extra credentials of all types
        for (let i = 0; i <= 3; i++) {
            newCredentialsList.push(
                new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy))
            );
            newCredentialsList.push(
                new CredentialsMaven(getRandomCredentialsData(CredentialType.maven))
            );
            newCredentialsList.push(
                new CredentialsSourceControlUsername(
                    getRandomCredentialsData(CredentialType.sourceControl)
                )
            );
            newCredentialsList.push(
                new CredentialsSourceControlKey(
                    getRandomCredentialsData(CredentialType.sourceControl)
                )
            );
        }
        newCredentialsList.forEach((currentCredential) => {
            currentCredential.create();
            createdCredentialsList.push(currentCredential);
        });
        // }
    });

    it("Navigation button validations", function () {
        // select 10 items per page
        Credentials.openList(10);

        // Run validation
        validatePagination();
    });

    after("Removing credentials, created earlier", () => {
        Credentials.openList();
        createdCredentialsList.forEach((currentCredential) => {
            currentCredential.delete();
        });
    });
});
