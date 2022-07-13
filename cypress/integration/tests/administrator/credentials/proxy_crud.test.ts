import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administrator/credentials/credentialsProxy";
import * as data from "../../../../utils/data_utils";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe("Validation of proxy credentials", () => {
    const proxyCreds = new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy));

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

    it("Creating proxy credentials", () => {
        proxyCreds.create();
    });

    it("Editing proxy credentials", () => {
        proxyCreds.edit({
            type: "Proxy",
            name: data.getRandomWord(8),
            description: "",
            username: "redhat",
            password: "redhat",
        });
    });

    after("Delete proxy credentials", () => {
        proxyCreds.delete();
    });
});
