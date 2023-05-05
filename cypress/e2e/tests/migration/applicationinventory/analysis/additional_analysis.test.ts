import {
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../../utils/utils";
import { Proxy } from "../../../../models/administration/proxy/proxy";
import { getRandomProxyData } from "../../../../../utils/data_utils";
import { ProxyType } from "../../../../views/proxy.view";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";

describe(["@tier2"], "Running analysis with incorrect proxy configuration", () => {
    let httpsProxy = new Proxy(getRandomProxyData(), ProxyType.https);
    let httpProxy = new Proxy(getRandomProxyData(), ProxyType.http);

    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
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

        const application = new Analysis(
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
        httpProxy.disable();
        httpsProxy.disable();
    });
});
