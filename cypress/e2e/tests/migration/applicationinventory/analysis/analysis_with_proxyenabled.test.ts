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

import { getRandomProxyData } from "../../../../../utils/data_utils";
import { getRandomAnalysisData, getRandomApplicationData } from "../../../../../utils/utils";
import { Proxy } from "../../../../models/administration/proxy/proxy";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { ProxyType } from "../../../../views/proxy.view";

let application: Analysis;

describe(["@tier3"], "Running analysis with incorrect proxy configuration", () => {
    let httpsProxy = new Proxy(getRandomProxyData(), ProxyType.https);
    let httpProxy = new Proxy(getRandomProxyData(), ProxyType.http);

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("Negative: Enable HTTP and HTTPS proxy, create an application and run application analysis", function () {
        httpProxy.excludeList = ["127.0.0.1", "github.com"];
        httpProxy.configureProxy();

        httpsProxy.excludeList = ["127.0.0.1", "github.com"];
        httpsProxy.configureProxy();

        application = new Analysis(
            getRandomApplicationData("bookServerApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        application.create();
        application.analyze();
        application.verifyAnalysisStatus("Failed");
    });

    after("Perform test data clean up", function () {
        Proxy.open();
        httpProxy.unConfigureProxy();
        httpsProxy.unConfigureProxy();
        application.delete();
    });
});
