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

import { click, createMultipleApplications, deleteByList, login } from "../../../../../utils/utils";
import { Application } from "../../../../models/migration/applicationinventory/application";
import {
    closeForm,
    cyclicDependenciesErrorMsg,
    northdependenciesDropdownBtn,
    southdependenciesDropdownBtn,
} from "../../../../views/applicationinventory.view";
import { helper } from "../../../../views/common.view";

let applicationsList: Array<Application> = [];

describe(["@tier3"], "Manage application dependencies", () => {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        applicationsList = createMultipleApplications(3);
    });

    it("Non-cyclic dependencies for applications", function () {
        const northboundApps: Array<string> = [applicationsList[0].name];
        const southboundApps: Array<string> = [applicationsList[2].name];

        // Add northbound and southbound dependencies for 2nd app from list
        applicationsList[1].addDependencies(northboundApps, southboundApps);

        // Verify app 1 contains 2nd app as its southbound dependency
        applicationsList[0].verifyDependencies([], [applicationsList[1].name]);

        // Verify app 3 contains 2nd app as its northbound dependency
        applicationsList[2].verifyDependencies([applicationsList[1].name]);

        // Remove the dependencies as part of cleanup for next test
        applicationsList[1].removeDependencies(northboundApps, southboundApps);
    });

    it("Bug MTA-2789: Cyclic dependencies for applications", function () {
        const northboundApps: Array<string> = [applicationsList[0].name];
        const southboundApps: Array<string> = [applicationsList[2].name];

        // Add northbound and southbound dependencies for 2nd app from list
        applicationsList[1].addDependencies(northboundApps, southboundApps);

        // Adding app[2] as northbound dependency for app[0] should yield cyclic error
        applicationsList[0].openManageDependencies();
        applicationsList[0].selectDependency(northdependenciesDropdownBtn, [
            applicationsList[2].name,
        ]);

        cy.get(helper).should("contain.text", cyclicDependenciesErrorMsg);
        click(closeForm);

        // Adding app[0] as southbound dependency for app[2] should yield cyclic error
        applicationsList[2].openManageDependencies();
        applicationsList[2].selectDependency(southdependenciesDropdownBtn, [
            applicationsList[0].name,
        ]);

        cy.get(helper).should("contain.text", cyclicDependenciesErrorMsg);
        click(closeForm);
    });

    after("Bug MTA-2789: Perform test data clean up", function () {
        Application.open(true);
        deleteByList(applicationsList);
    });
});
