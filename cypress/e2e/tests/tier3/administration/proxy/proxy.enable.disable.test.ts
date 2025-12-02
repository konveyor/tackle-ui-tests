/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    getRandomCredentialsData,
    getRandomProxyData,
    getRandomWord,
} from "../../../../utils/data_utils";
import { login } from "../../../../utils/utils";
import { CredentialsProxy } from "../../../models/administration/credentials/credentialsProxy";
import { Proxy } from "../../../models/administration/proxy/proxy";
import { CredentialType } from "../../../types/constants";
import { submitButton } from "../../../views/common.view";
import { helper, port, ProxyType, ProxyViewSelectorsByType } from "../../../views/proxy.view";

describe(["@tier3"], "Proxy operations", () => {
    let httpsProxy = new Proxy(getRandomProxyData(), ProxyType.https);
    let httpProxy = new Proxy(getRandomProxyData(), ProxyType.http);
    const httpProxyCredentials = new CredentialsProxy(
        getRandomCredentialsData(CredentialType.proxy)
    );
    const httpsProxyCredentials = new CredentialsProxy(
        getRandomCredentialsData(CredentialType.proxy)
    );

    before("Login", function () {
        login();
        cy.visit("/");
        httpProxyCredentials.create();
        httpsProxyCredentials.create();
    });

    it("Http Proxy port and host field validation", function () {
        httpProxy.enable();
        httpProxy.fillHost(getRandomWord(121));
        httpProxy.fillPort("Invalid port test");
        cy.get(port)
            .closest("div")
            .within(() => {
                cy.get(helper).contains("This field is required");
            });
        cy.get(ProxyViewSelectorsByType[httpProxy.type].host)
            .closest("div")
            .within(() => {
                cy.get(helper).contains("This field must contain fewer than 120 characters.");
            });
        cy.get(submitButton).should("be.disabled");
        httpProxy.configureProxy();
        httpProxy.disable();
    });

    it("Https Proxy port and host field validation", function () {
        httpsProxy.enable();
        httpsProxy.fillHost(getRandomWord(121));
        httpsProxy.fillPort("Invalid port test");
        cy.get(port)
            .closest("div")
            .within(() => {
                cy.get(helper).contains("This field is required");
            });
        cy.get(ProxyViewSelectorsByType[httpsProxy.type].host)
            .closest("div")
            .within(() => {
                cy.get(helper).contains("This field must contain fewer than 120 characters.");
            });
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
        httpProxy.credentials = httpProxyCredentials;
        httpProxy.configureProxy();
    });

    it("Enable HTTPS proxy with valid configuration", () => {
        httpsProxy.excludeList = ["127.0.0.1", "github.com"];
        httpsProxy.credentials = httpsProxyCredentials;
        httpsProxy.configureProxy();
    });

    after("Perform test data clean up", function () {
        httpProxy.disable();
        httpsProxy.disable();
        httpsProxyCredentials.delete();
        httpProxyCredentials.delete();
    });
});
