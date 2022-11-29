import { hasToBeSkipped, login, preservecookies } from "../../../../utils/utils";
import { Proxy } from "../../../models/administrator/proxy/proxy";
import { CredentialsProxy } from "../../../models/administrator/credentials/credentialsProxy";
import {
    getRandomCredentialsData,
    getRandomProxyData,
    getRandomWord,
} from "../../../../utils/data_utils";
import { CredentialType } from "../../../types/constants";
import { ProxyType, ProxyViewSelectors, ProxyViewSelectorsByType } from "../../../views/proxy.view";
import { submitButton } from "../../../../integration/views/common.view";

describe("Proxy operations", () => {
    let httpsProxy = new Proxy(getRandomProxyData(), ProxyType.https);
    let httpProxy = new Proxy(getRandomProxyData(), ProxyType.http);
    const httpProxyCreds = new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy));
    const httpsProxyCreds = new CredentialsProxy(getRandomCredentialsData(CredentialType.proxy));

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        httpProxyCreds.create();
        httpsProxyCreds.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Http Proxy port and host field validation", function () {
        Proxy.open();
        httpProxy.enable();
        httpProxy.fillHost(getRandomWord(121));
        httpProxy.fillPort("Invalid port");
        cy.get(ProxyViewSelectors.portHelper).contains("This field is required");
        cy.get(ProxyViewSelectorsByType[httpProxy.type].hostHelper).contains(
            "This field must contain fewer than 120 characters."
        );
        cy.get(submitButton).should("be.disabled");
        httpProxy.unConfigureProxy();
    });

    it("Https Proxy port and host field validation", function () {
        Proxy.open();
        httpsProxy.enable();
        httpsProxy.fillHost(getRandomWord(121));
        httpsProxy.fillPort("Invalid port");
        cy.get(ProxyViewSelectors.portHelper).contains("This field is required");
        cy.get(ProxyViewSelectorsByType[httpsProxy.type].hostHelper).contains(
            "This field must contain fewer than 120 characters."
        );
        cy.get(submitButton).should("be.disabled");
        httpsProxy.unConfigureProxy();
    });

    it("Enable HTTP proxy ", function () {
        httpProxy.excludeList = ["127.0.0.1", "github.com"];
        httpProxy.credentials = httpProxyCreds;
        httpProxy.configureProxy();
    });

    it("Disable HTTP proxy", function () {
        httpProxy.disable();
        httpProxyCreds.delete();
    });

    it("Enable HTTPS proxy", () => {
        httpsProxy.excludeList = ["127.0.0.1", "github.com"];
        httpsProxy.credentials = httpsProxyCreds;
        httpsProxy.configureProxy();
    });

    it("Disable HTTPS proxy", () => {
        httpsProxy.disable();
        httpsProxyCreds.delete();
    });
});
