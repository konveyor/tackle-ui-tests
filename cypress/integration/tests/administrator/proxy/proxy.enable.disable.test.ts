import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { Proxy } from "../../../models/administrator/proxy/proxy";
import { CredentialsProxy } from "../../../models/administrator/credentials/credentialsProxy";
import { getRandomCredentialsData, getRandomProxyData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";

describe("Proxy operations", () => {
    let proxy = new Proxy(getRandomProxyData());
    const proxyCreds = new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy));

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        proxyCreds.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Enable HTTPS proxy", () => {
        proxy.httpsEnabled = true;
        proxy.excludeList = ["127.0.0.1", "github.com"];
        proxy.credentials = proxyCreds;
        proxy.enable();
    });

    it("Disable HTTPS proxy", () => {
        proxy.disable();
        proxyCreds.delete();
    });
});
