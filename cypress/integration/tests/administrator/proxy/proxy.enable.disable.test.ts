import {
    hasToBeSkipped,
    login,
    preservecookies,
    selectCheckBox,
    unSelectCheckBox,
} from "../../../../utils/utils";
import { Proxy } from "../../../models/administrator/proxy/proxy";
import { CredentialsProxy } from "../../../models/administrator/credentials/credentialsProxy";
import { getRandomCredentialsData, getRandomProxyData } from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { fillHost, fillPort, ProxyType, ProxyViewSelectors } from "../../../views/proxy.view";
import { submitButton } from "../../../../integration/views/common.view";

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

    it("Http Proxy port and host field validation", function () {
        Proxy.open();
        selectCheckBox(ProxyViewSelectors.httpSwitch);
        fillHost(ProxyType.http, proxy.hostname);
        fillPort(ProxyType.http, "Invalid port");
        cy.get(ProxyViewSelectors.portHelper).contains("This field is required");
        cy.get(submitButton).should("be.disabled");
        unSelectCheckBox(ProxyViewSelectors.httpSwitch);
    });

    it("Https Proxy port and host field validation", function () {
        Proxy.open();
        selectCheckBox(ProxyViewSelectors.httpsSwitch);
        fillHost(ProxyType.https, proxy.hostname);
        fillPort(ProxyType.https, "Invalid port");
        cy.get(ProxyViewSelectors.portHelper).contains("This field is required");
        cy.get(submitButton).should("be.disabled");
        unSelectCheckBox(ProxyViewSelectors.httpsSwitch);
    });

    it("Enable HTTP proxy ", function () {
        proxy.httpEnabled = true;
        proxy.enable();
    });

    it("Disable HTTP proxy", function () {
        proxy.disable();
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
