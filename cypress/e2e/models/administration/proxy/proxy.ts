import { getRandomProxyData } from "../../../../utils/data_utils";
import {
    clearInput,
    click,
    clickByText,
    inputText,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import { administration, button, SEC } from "../../../types/constants";
import { CredentialsProxyData, ProxyData } from "../../../types/types";
import {
    excludedList,
    navLink,
    ProxyType,
    ProxyViewSelectorsByType,
} from "../../../views/proxy.view";

export class Proxy {
    hostname: string;
    port: string;
    credentials: CredentialsProxyData;
    excludeList = [];
    type: ProxyType;
    static url: string = Cypress.config("baseUrl") + "/proxies";

    constructor(proxyData: ProxyData, type: ProxyType) {
        const { hostname, port, credentials, excludeList } = proxyData;
        this.hostname = hostname;
        this.port = port;
        this.credentials = credentials;
        this.excludeList = excludeList;
        this.type = type;
    }

    static open() {
        cy.url().then((url) => {
            if (url !== Proxy.url) {
                selectUserPerspective(administration);
                clickByText(navLink, "Proxy");
                cy.contains("h1", "Proxy configuration", { timeout: 5 * SEC });
            }
        });
    }

    static disableAllProxies() {
        const proxy = new Proxy(getRandomProxyData(), ProxyType.http);
        proxy.excludeList = null;
        proxy.disable();
        proxy.type = ProxyType.https;
        proxy.disable();
    }

    configureProxy(): void {
        this.enable();
        this.fillHost();
        this.fillPort();
        if (this.credentials) {
            const identityRequiredSelector = ProxyViewSelectorsByType[this.type].identityRequired;
            cy.get(identityRequiredSelector).then(($checkbox) => {
                if (!$checkbox.prop("checked")) {
                    click(identityRequiredSelector);
                }
            });
            click(ProxyViewSelectorsByType[this.type].credentialsSelectToggle);
            clickByText(button, this.credentials.name);
        }
        if (this.excludeList) {
            this.fillExcludeList();
        }
        submitForm();
        cy.wait(2 * SEC);
    }

    unConfigureProxy(): void {
        clearInput(ProxyViewSelectorsByType[this.type].host);
        clearInput(ProxyViewSelectorsByType[this.type].port);
        clearInput(excludedList);
        this.disable();
    }

    fillExcludeList(): void {
        let fullList = "";
        this.excludeList.forEach((current) => {
            fullList = fullList + current + ", ";
        });
        cy.log(fullList);
        inputText(excludedList, fullList);
    }

    fillHost(host?: string): void {
        inputText(ProxyViewSelectorsByType[this.type].host, host ?? this.hostname);
    }

    fillPort(port?: string): void {
        inputText(ProxyViewSelectorsByType[this.type].port, port ?? this.port);
        cy.get(ProxyViewSelectorsByType[this.type].port).blur();
    }

    enable(): void {
        Proxy.open();
        const selector = ProxyViewSelectorsByType[this.type].enabledSwitch;
        cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
            if (!$checkbox.prop("checked")) {
                click(selector);
            }
        });
    }

    disable(): void {
        Proxy.open();
        const selector = ProxyViewSelectorsByType[this.type].enabledSwitch;
        cy.get(selector, { timeout: 120 * SEC }).then(($checkbox) => {
            if ($checkbox.prop("checked")) {
                click(selector);
                submitForm();
                cy.wait(2 * SEC);
            }
        });
    }
}
