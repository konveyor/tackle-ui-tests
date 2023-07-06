import { createMultipleApplications, deleteByList, login } from "../../../utils/utils";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
import { Application } from "../../models/migration/applicationinventory/application";
const metrics = new Metrics();
const metricName = "konveyor_applications_inventoried";
let applicationList: Array<Application> = [];
let count = 0;

describe(
    ["@tier2"],
    "Custom Metrics - Count the current number of applications in inventory",
    function () {
        before("Login", function () {
            // Perform login
            login();
        });

        beforeEach("Get the current gauge value", function () {
            metrics.getValue(metricName).then((counterValue) => {
                count = counterValue;
            });
        });

        it("Create applications - Validate the applications count increased", function () {
            // Create 5 applications
            applicationList = createMultipleApplications(3);
            count += applicationList.length;

            // Validate the applications count increased
            metrics.validateMetric(metricName, count);
        });

        it("Delete application - Validate the applications count decreased", function () {
            // Delete the first application item
            let firstApplicationItem = applicationList.shift();
            firstApplicationItem.delete();
            count--;

            // Validate the applications count decreased
            metrics.validateMetric(metricName, count);

            // Delete the last application item
            let lastApplicationItem = applicationList.pop();
            lastApplicationItem.delete();
            count--;

            // Validate the applications count decreased
            metrics.validateMetric(metricName, count);
        });

        after("Perform test data clean up", function () {
            deleteByList(applicationList);
        });
    }
);
