import {
    clearInput,
    click,
    clickByText,
    disableProxy,
    inputText,
    selectCheckBox,
    selectUserPerspective,
    submitForm,
    unSelectCheckBox,
} from "../../../../utils/utils";
import { button } from "../../../types/constants";
import { CredentialsProxyData, ProxyData } from "../../../types/types";
import { ProxyType, ProxyViewSelectors } from "../../../views/proxy.view";

export class Proxy {
    hostname;
    port;
    credentials: CredentialsProxyData;
    httpEnabled = false;
    httpsEnabled = false;
    excludeList = [];

    constructor(proxyData: ProxyData) {
        const { hostname, port, httpEnabled, credentials, httpsEnabled, excludeList } = proxyData;
        this.hostname = hostname;
        this.port = port;
        this.httpEnabled = httpEnabled;
        this.credentials = credentials;
        this.httpsEnabled = httpsEnabled;
        this.excludeList = excludeList;
    }

    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Proxy");
        cy.contains("h1", "Proxy configuration", { timeout: 5000 });
    }

    enableSwitch(selector): void {
        selectCheckBox(selector);
    }

    disableSwitch(selector): void {
        unSelectCheckBox(selector);
    }

    protected configureProxy(type: string): void {
        cy.wait(5000); // This wait is required because of problems with page rendering, will be fixed later
        this.enableSwitch(`#${type}Proxy`);
        inputText(`[name="${type}Host"]`, this.hostname);
        inputText(`[name="${type}Port"]`, this.port);
        if (this.credentials) {
            click(`#${type}-identity-required`);
            click(`#${type}-proxy-credentials-select-toggle`);
            clickByText(button, this.credentials.name);
        }
        if (this.excludeList) {
            this.fillExcludeList();
        }
        submitForm();
    }

    protected unConfigureProxy(type: string): void {
        clearInput(`[name="${type}Host"]`);
        clearInput(`[name="${type}Port"]`);
        this.disableSwitch(`#${type}Proxy`);
    }

    fillExcludeList(): void {
        let fullList = "";
        this.excludeList.forEach((current) => {
            fullList = fullList + current + ", ";
        });
        cy.log(fullList);
        inputText('[aria-label="excluded"]', fullList);
    }

    fillHost(type: ProxyType, host: string): void {
        inputText(
            type === ProxyType.http ? ProxyViewSelectors.httpHost : ProxyViewSelectors.httpsHost,
            host
        );
    }

    fillPort(type: ProxyType, port: string): void {
        inputText(
            type === ProxyType.http ? ProxyViewSelectors.httpPort : ProxyViewSelectors.httpsPort,
            port
        );
    }

    enable(): void {
        Proxy.open();
        if (this.httpEnabled) {
            this.configureProxy("http");
        }
        if (this.httpsEnabled) {
            this.configureProxy("https");
        }
    }

    disable(): void {
        Proxy.open();
        clearInput('[aria-label="excluded"]');
        if (this.httpEnabled) {
            this.unConfigureProxy("http");
            this.httpEnabled = false;
        }
        if (this.httpsEnabled) {
            this.unConfigureProxy("https");
            this.httpsEnabled = false;
        }
    }

    disableProxy(): void {
        // If proxy is enabled just switches it off
        Proxy.open();
        cy.wait(5000);
        disableProxy(`#${"http"}Proxy`);
        cy.wait(2000);
        disableProxy(`#${"https"}Proxy`);
        cy.wait(2000);
    }

    //TODO: Write disable method that will clear all fields and disable proxy
    //TODO: Try to validate current status of switch before clicking
    //TODO: Add filling in exclude list
}
