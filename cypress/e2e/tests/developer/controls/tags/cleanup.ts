import {
    deleteAllTagsAndTagCategories,
    hasToBeSkipped,
    login,
    preservecookies,
} from "../../../../../utils/utils";

describe("Tag validations", { tags: "@tier2" }, () => {
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

    it("Running tag  and tag type cleanup", function () {
        deleteAllTagsAndTagCategories();
    });
});
