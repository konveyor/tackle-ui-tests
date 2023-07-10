import { login } from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administration/credentials/credentialsProxy";
import { getRandomCredentialsData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe(["@tier2"], "Validation of proxy credentials", () => {
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
        // Perform login
        login();
    });

    it("Creating proxy credentials and cancelling without saving", () => {
        proxyCreds.create(toBeCanceled);
    });

    it("Creating proxy credentials", () => {
        proxyCreds.create();
    });

    it("Editing proxy credentials and cancelling without saving", () => {
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
