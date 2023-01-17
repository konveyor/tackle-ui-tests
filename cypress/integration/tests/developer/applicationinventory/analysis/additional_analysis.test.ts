import {
    getRandomAnalysisData,
    getRandomApplicationData,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../../utils/utils";
import { Proxy } from "../../../../models/administrator/proxy/proxy";
import { getRandomProxyData } from "../../../../../utils/data_utils";
import { ProxyType } from "../../../../views/proxy.view";
import { Analysis } from "../../../../models/developer/applicationinventory/analysis";

describe("Running analysis with incorrect proxy configuration", { tags: "@tier2" }, () => {
    let httpsProxy = new Proxy(getRandomProxyData(), ProxyType.https);
    let httpProxy = new Proxy(getRandomProxyData(), ProxyType.http);

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

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

    it("Negative: Enable HTTP and HTTPS proxy, create an application and run application analysis ", function () {
        httpProxy.excludeList = ["127.0.0.1", "github.com"];
        httpProxy.configureProxy();

        httpsProxy.excludeList = ["127.0.0.1", "github.com"];
        httpsProxy.configureProxy();

        const application = new Analysis(
            getRandomApplicationData("bookServerApp", { sourceData: this.appData[0] }),
            getRandomAnalysisData(this.analysisData[0])
        );
        application.create();
        application.analyze();
        application.verifyAnalysisStatus("Failed");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier2")) return;
        httpProxy.disable();
        httpsProxy.disable();
    });
});
