import {
    createMultipleApplications,
    deleteApplicationTableRows,
    login,
} from "../../../utils/utils";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
import { Application } from "../../models/migration/applicationinventory/application";

let applicationList: Array<Application> = [];
let metrics = new Metrics();
let count = 0;

describe(
    ["@tier2"],
    "Custom Metrics - Count the current number of applications in inventory",
    function () {
        before("Login and delete all applications", function () {
            // Perform login
            login();

            // // Navigate to Application inventory tab, delete all applications
            deleteApplicationTableRows();
        });

        after("Perform test data clean up", function () {
            deleteApplicationTableRows();
        });

        it("Validate the applications count is zero", function () {
            metrics.validateApplicationsInventoried(count);
        });

        it("Create applications - Validate the applications count increased", function () {
            // Create 5 applications
            applicationList = createMultipleApplications(5);
            count = applicationList.length;

            // Validate the applications count increased
            metrics.validateApplicationsInventoried(count);
        });

        it("Delete application - Validate the applications count decreased", function () {
            // Delete the first application item
            let firstApplicationItem = applicationList.shift();
            firstApplicationItem.delete();
            count--;

            // Validate the applications count decreased
            metrics.validateApplicationsInventoried(count);

            // Delete the last application item
            let lastApplicationItem = applicationList.pop();
            lastApplicationItem.delete();
            count--;

            // Validate the applications count decreased
            metrics.validateApplicationsInventoried(count);
        });
    }
);
