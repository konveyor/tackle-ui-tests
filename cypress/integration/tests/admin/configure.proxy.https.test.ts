import {Proxy} from "../../models/admin/proxy";
import {hasToBeSkipped, login, preservecookies} from "../../../utils/utils";
import {CredentialsProxy} from "../../models/admin/credentialsProxy";
import * as data from "../../../utils/data_utils";

describe("Proxy operations", () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        // cy.waitForReact(1000, '#root');
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        // login();
    });

    let proxy = new Proxy('rhev-node-12.rdu2.scalelab.redhat.com', "3128");

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        // preservecookies();
        login();
    });

    const proxyCreds = new CredentialsProxy(data.getRandomWord(8), 'redhat', 'redhat');

    // it("Creating proxy credentials", ()=> {
    //     proxyCreds.create()
    // })

    it("Enable HTTPS proxy", () => {
        proxy.isHttps = true;
        proxy.excludeList = ['127.0.0.1', 'github.com'];
        // proxy.useCredentials = true;
        // proxy.credentials = proxyCreds;
        proxy.enable();
    })

    // it("Disable HTTPS proxy", () => {
    //     proxy.disable();
    // })

})