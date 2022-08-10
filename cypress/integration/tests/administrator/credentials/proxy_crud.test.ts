import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administrator/credentials/credentialsProxy";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe("Validation of proxy credentials", () => {
    const proxyCreds = new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy));
    const toBeCanceled = true;
    const validConfiguration = {
        type: "Proxy",
        name: "ValidProxyCredentials",
        description: "This is valid data credentials",
        username: "redhat",
        password: "redhat",
    };

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

    it("Creating proxy credentials and cancelling without saving", () => {
        proxyCreds.create(toBeCanceled);
    });

    it("Creating proxy credentials", () => {
        proxyCreds.create();
    });

    it.skip("Editing proxy credentials and cancelling without saving", () => {
        proxyCreds.edit(validConfiguration, toBeCanceled);
    });

    it("Editing proxy credentials", () => {
        proxyCreds.edit(validConfiguration);
    });

    it("Delete proxy credentials and cancel deletion", () => {
        proxyCreds.delete(toBeCanceled);
    });

    after("Delete proxy credentials", () => {
        proxyCreds.delete();
    });
});
