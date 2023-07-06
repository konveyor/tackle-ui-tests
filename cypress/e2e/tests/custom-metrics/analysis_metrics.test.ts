import {
    login,
    getRandomApplicationData,
    getRandomAnalysisData,
    deleteByList,
} from "../../../utils/utils";
import { Analysis } from "../../models/migration/applicationinventory/analysis";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
import { Application } from "../../models/migration/applicationinventory/application";
const metrics = new Metrics();
const metricName = "konveyor_tasks_initiated_total";
let applicationList: Array<Application> = [];
let counter: number;

describe(["@tier2"], "Custom Metrics - Count the total number of initiated analyses", function () {
    before("Login", function () {
        // Perform login
        login();
    });

    beforeEach("Load data and define interceptors", function () {
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("GET", "/hub/application*").as("getApplication");

        // Get the current counter value
        metrics.getValue(metricName).then((counterValue) => {
            counter = counterValue;
        });
    });

    it("Perform analyses - Validate the tasks initiated counter increased", function () {
        // For source code analysis application must have source code URL git or svn
        const bookServerApp = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );
        bookServerApp.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        bookServerApp.analyze();
        bookServerApp.verifyAnalysisStatus("Completed");
        counter++;
        applicationList.push(bookServerApp);

        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData["uploadbinary_analysis_on_acmeair"])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        counter++;
        applicationList.push(application);

        // Validate the tasks initiated counter increased
        metrics.validateMetric(metricName, counter);
    });

    it("BUG MTA-894 | Perform analysis on tackle-testapp without credentials - Validate analysis failed but counter increased", function () {
        // For tackle test app source credentials are required.
        const tackleTestApp = new Analysis(
            getRandomApplicationData("tackle-testapp", {
                sourceData: this.appData["tackle-testapp-git"],
            }),
            getRandomAnalysisData(this.analysisData["source+dep_analysis_on_tackletestapp"])
        );
        tackleTestApp.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        tackleTestApp.analyze();
        tackleTestApp.verifyAnalysisStatus("Failed");

        counter++;
        applicationList.push(tackleTestApp);

        // Validate the tasks initiated counter increased
        metrics.validateMetric(metricName, counter);
    });

    it("Delete applications - Validate the tasks initiated counter didn't change", function () {
        deleteByList(applicationList);
        metrics.validateMetric(metricName, counter);
    });
});
