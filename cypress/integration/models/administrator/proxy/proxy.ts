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
import { ProxyType, ProxyViewSelectors, ProxyViewSelectorsByType } from "../../../views/proxy.view";

export class Proxy {
    hostname;
    port;
    credentials: CredentialsProxyData;
    httpEnabled = false;
    httpsEnabled = false;
    excludeList = [];
    type: ProxyType;
    static url: string = Cypress.env("tackleUrl") + "/proxies";

    constructor(proxyData: ProxyData, type: ProxyType) {
        const { hostname, port, httpEnabled, credentials, httpsEnabled, excludeList } = proxyData;
        this.hostname = hostname;
        this.port = port;
        this.httpEnabled = httpEnabled;
        this.credentials = credentials;
        this.httpsEnabled = httpsEnabled;
        this.excludeList = excludeList;
        this.type = type;
    }

    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Proxy");
        cy.contains("h1", "Proxy configuration", { timeout: 5000 });
    }

    configureProxy(): void {
        cy.wait(5000); // This wait is required because of problems with page rendering, will be fixed later
        this.enable();
        this.fillHost();
        this.fillPort();
        if (this.credentials) {
            click(ProxyViewSelectorsByType[this.type].identityRequired);
            click(ProxyViewSelectorsByType[this.type].credentialsSelectToggle);
            clickByText(button, this.credentials.name);
        }
        if (this.excludeList) {
            this.fillExcludeList();
        }
        submitForm();
    }

    unConfigureProxy(): void {
        clearInput(ProxyViewSelectorsByType[this.type].host);
        clearInput(ProxyViewSelectorsByType[this.type].port);
        clearInput(ProxyViewSelectors.excludedList);
        this.disable();
    }

    fillExcludeList(): void {
        let fullList = "";
        this.excludeList.forEach((current) => {
            fullList = fullList + current + ", ";
        });
        cy.log(fullList);
        inputText(ProxyViewSelectors.excludedList, fullList);
    }

    fillHost(host?: string): void {
        inputText(ProxyViewSelectorsByType[this.type].host, host ?? this.hostname);
    }

    fillPort(port?: string): void {
        inputText(ProxyViewSelectorsByType[this.type].port, port ?? this.port);
    }

    enable(): void {
        cy.url().then((url) => {
            if (url !== Proxy.url) {
                Proxy.open();
            }
            selectCheckBox(ProxyViewSelectorsByType[this.type].enabledSwitch);
        });
    }

    disable(): void {
        cy.url().then((url) => {
            if (url !== Proxy.url) {
                Proxy.open();
            }
            unSelectCheckBox(ProxyViewSelectorsByType[this.type].enabledSwitch);
        });
    }

    //TODO: Write disable method that will clear all fields and disable proxy
    //TODO: Try to validate current status of switch before clicking
    //TODO: Add filling in exclude list
}
