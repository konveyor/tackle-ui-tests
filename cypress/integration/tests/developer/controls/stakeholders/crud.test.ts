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
    login,
    exists,
    notExists,
    existsWithinRow,
    expandRowDetails,
    closeRowDetails,
    hasToBeSkipped,
    preservecookies,
    selectUserPerspective,
    deleteByList,
} from "../../../../../utils/utils";
import { Stakeholders } from "../../../../models/developer/controls/stakeholders";
import { Stakeholdergroups } from "../../../../models/developer/controls/stakeholdergroups";
import { Jobfunctions } from "../../../../models/developer/controls/jobfunctions";
import { migration, tdTag } from "../../../../types/constants";
import { groupsCount } from "../../../../views/stakeholders.view";
import * as data from "../../../../../utils/data_utils";

describe("Stakeholder CRUD operations", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
        cy.intercept("DELETE", "/hub/stakeholder*/*").as("deleteStakeholder");
    });

    it("Stakeholder CRUD", function () {
        selectUserPerspective(migration);
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        // Create new stakeholder
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Edit the current stakeholder's name
        let updatedStakeholderName = data.getFullName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");

        // Assert that stakeholder name got edited
        exists(updatedStakeholderName);

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        notExists(stakeholder.email);
    });

    it("Stakeholder CRUD cancel", function () {
        selectUserPerspective(migration);
        let initialStakeholderName = data.getFullName();
        const stakeholder = new Stakeholders(data.getEmail(), initialStakeholderName);
        // Cancel the creation of new stakeholder task
        stakeholder.create(true);
        notExists(stakeholder.email);

        // Create new stakeholder for edit and delete cancel verification purpose
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Cancel the Edit stakeholder task
        stakeholder.edit({}, true);

        // Assert that stakeholder name did not get edited
        exists(initialStakeholderName);

        // Cancel the Delete stakeholder task
        stakeholder.delete(true);

        // Assert that stakeholder still exists, as delete was cancelled
        exists(stakeholder.email);

        // Finally, perform clean up by deleting the stakeholder
        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");
        // notExists(stakeholder.email);
    });

    it("Stakeholder CRUD operations with members (jobfunction and groups)", function () {
        selectUserPerspective(migration);
        let jobFunctionsList: Array<Jobfunctions> = [];
        let stakeholderGroupList: Array<Stakeholdergroups> = [];
        let stakeHolderGroupNameList: Array<string> = [];
        for (let i = 0; i < 2; i++) {
            // Create new job functions
            const jobfunction = new Jobfunctions(data.getJobTitle());
            jobfunction.create();
            jobFunctionsList.push(jobfunction);

            // Create new stakeholder groups
            const stakeholderGroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription()
            );
            stakeholderGroup.create();
            stakeholderGroupList.push(stakeholderGroup);
            stakeHolderGroupNameList.push(stakeholderGroup.name);
        }

        // Create new object for stakeholder
        const stakeholder = new Stakeholders(
            data.getEmail(),
            data.getFullName(),
            jobFunctionsList[0].name,
            [stakeHolderGroupNameList[0]]
        );

        // Create new stakeholder with one of the job function and group created above
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email);

        // Edit the current stakeholder's name, jobfunction and stakeholder group (by removing first one and adding second)
        stakeholder.edit({
            name: data.getFullName(),
            jobfunction: jobFunctionsList[1].name,
            groups: stakeHolderGroupNameList,
        });
        cy.wait("@postStakeholder");
        cy.wait("@getStakeholders");
        cy.wait(2000);

        // Assert that edit operation has been done by checking number of groups and added group exists
        expandRowDetails(stakeholder.email);
        existsWithinRow(stakeholder.email, "div > dd", stakeHolderGroupNameList[1]);
        closeRowDetails(stakeholder.email);

        // Assert that previous stakeholder group was removed and only one member is present
        cy.get(tdTag).contains(stakeholder.email).siblings(groupsCount).should("contain", "1");

        // Delete stakeholder
        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");

        // Assert that newly created stakeholder is deleted
        notExists(stakeholder.email);

        // Perform clean up by deleting jobfunctions and groups created at the start of test
        deleteByList(jobFunctionsList);
        deleteByList(stakeholderGroupList);
    });
});
