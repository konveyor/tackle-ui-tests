/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />
import { createMultipleApplications, deleteByList } from "../../../utils/utils";
import { Application } from "../../models/migration/applicationinventory/application";
import { Metrics } from "../../models/migration/custom-metrics/custom-metrics";
const metrics = new Metrics();
const metricName = "konveyor_applications_inventoried";
let applicationList: Array<Application> = [];
let count = 0;

describe(
    ["@tier2"],
    "Custom Metrics - Count the current number of applications in inventory",
    function () {
        beforeEach("Get the current gauge value", function () {
            metrics.getValue(metricName).then((counterValue) => {
                count = counterValue;
            });
        });

        it("Create applications - Validate the applications count increased", function () {
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
