import { login, preservecookies } from "../../../../utils/utils";
import { ReportConfig } from "../../../models/developer/reports/reportConfig";

describe("This test set is enabling HTML/CSV reports download and downloads it", function () {
    before("Login and create test data", function () {
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("This test is enabling download of HTML and CSV reports", function () {
        let reportConfig = ReportConfig.getInstance();
        reportConfig.enableDownloadHtml();
        reportConfig.enableDownloadCsv();
    });
});
