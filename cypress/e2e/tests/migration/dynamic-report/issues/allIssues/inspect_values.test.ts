import { login } from "../../../../../../utils/utils";
import { Issues } from "../../../../../models/migration/dynamic-report/issues/issues";
import { AppIssue } from "../../../../../types/types";

describe(["@tier2"], "Issues filtering", () => {
    before("Login", function () {
        login();
    });

    beforeEach("Load data", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("", function () {
        Issues.openList();
        let issueList = this.analysisData["source_analysis_on_bookserverapp"]["issues"];
        issueList.forEach((issue: AppIssue) => {
            Issues.unfold(issue.name);
        });
    });
});
