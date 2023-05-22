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
import { submitButton } from "../../../../e2e/views/common.view";

describe("Proxy operations", { tags: "@tier2" }, () => {
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
        httpProxy.enable();
        httpProxy.fillHost(getRandomWord(121));
        httpProxy.fillPort("Invalid port test");
        cy.get(ProxyViewSelectors.portHelper).contains("This field is required");
        cy.get(ProxyViewSelectorsByType[httpProxy.type].hostHelper).contains(
            "This field must contain fewer than 120 characters."
        );
        cy.get(submitButton).should("be.disabled");
        httpProxy.configureProxy();
        httpProxy.disable();
    });

    it("Https Proxy port and host field validation", function () {
        httpsProxy.enable();
        httpsProxy.fillHost(getRandomWord(121));
        httpsProxy.fillPort("Invalid port test");
        cy.get(ProxyViewSelectors.portHelper).contains("This field is required");
        cy.get(ProxyViewSelectorsByType[httpsProxy.type].hostHelper).contains(
            "This field must contain fewer than 120 characters."
        );
        cy.get(submitButton).should("be.disabled");
        httpsProxy.configureProxy();
        httpsProxy.disable();
    });

    it("Disable HTTP proxy with invalid configuration", function () {
        httpProxy.configureProxy();
        httpProxy.unConfigureProxy();
    });

    it("Disable HTTPs proxy with invalid configuration", function () {
        httpsProxy.configureProxy();
        httpsProxy.unConfigureProxy();
    });

    it("Enable HTTP proxy ", function () {
        httpProxy.excludeList = ["127.0.0.1", "github.com"];
        httpProxy.credentials = httpProxyCreds;
        httpProxy.configureProxy();
    });

    it("Disable HTTP proxy with valid configuration", function () {
        httpProxy.disable();
    });

    it("Enable HTTPS proxy with valid configuration", () => {
        httpsProxy.excludeList = ["127.0.0.1", "github.com"];
        httpsProxy.credentials = httpsProxyCreds;
        httpsProxy.configureProxy();
    });

    it("Disable HTTPS proxy with valid configuration", () => {
        httpsProxy.disable();
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier2")) return;
        httpsProxyCreds.delete();
        httpProxyCreds.delete();
    });
});
