import {hasToBeSkipped, login, preservecookies} from "../../../../utils/utils";
import {CredentialsProxy} from "../../../models/admin/credentialsProxy";
import * as data from "../../../../utils/data_utils"

describe("Validation of proxy credentials", () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Creating proxy credentials", ()=> {
        const proxyCreds = new CredentialsProxy(data.getRandomWord(8), 'redhat', 'redhat');
        proxyCreds.create()
    })
})