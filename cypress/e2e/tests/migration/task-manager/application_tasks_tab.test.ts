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
import {
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
    sidedrawerTab,
} from "../../../../utils/utils";
import { Analysis } from "../../../models/migration/applicationinventory/analysis";

let application: Analysis;
const tasksKindsList = ["language-discovery", "tech-discovery", "analyzer"];

describe(["@tier2"], "Verify 'Tasks' Tab Displays Expected Task Kinds", () => {
    before("Login", function () {
        login();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });
    });

    it("opens the Tasks tab and verifies all expected task kinds are present", function () {
        // Polarion TC MTA-624
        application = new Analysis(
            getRandomApplicationData("bookserverApp", {
                sourceData: this.appData["bookserver-app"],
            }),
            getRandomAnalysisData(this.analysisData["source_analysis_on_bookserverapp"])
        );

        application.create();
        application.analyze();

        sidedrawerTab(application.name, "Tasks");

        cy.get("[data-label='Task Kind']").should((tasks) => {
            const foundTasksList = tasks.toArray().map((task) => task.innerText);
            expect(
                foundTasksList,
                `Expected task kinds not found. Found: [${foundTasksList.join(", ")}]`
            ).to.include.members(tasksKindsList);
        });
    });

    after("Perform test data clean up", function () {
        application.delete();
    });
});
