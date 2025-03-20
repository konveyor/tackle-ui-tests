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

import * as data from "../../../../../utils/data_utils";
import {
    closeRowDetails,
    deleteByList,
    exists,
    existsWithinRow,
    expandRowDetails,
    notExists,
} from "../../../../../utils/utils";
import { Jobfunctions } from "../../../../models/migration/controls/jobfunctions";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { tdTag } from "../../../../types/constants";
import { groupsCount, stakeHoldersTable } from "../../../../views/stakeholders.view";
let jobFunctionsList: Array<Jobfunctions> = [];
let stakeholderGroupList: Array<Stakeholdergroups> = [];

describe(["@tier2", "@interop"], "Stakeholder CRUD operations", () => {
    beforeEach("Interceptors", function () {
        cy.intercept("POST", "/hub/stakeholder*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholder*").as("getStakeholders");
        cy.intercept("DELETE", "/hub/stakeholder*/*").as("deleteStakeholder");
    });

    it("Stakeholder CRUD", function () {
        const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email, stakeHoldersTable);

        let updatedStakeholderName = data.getFullName();
        stakeholder.edit({ name: updatedStakeholderName });
        cy.wait("@getStakeholders");
        exists(updatedStakeholderName, stakeHoldersTable);

        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");
        notExists(stakeholder.email, stakeHoldersTable);
    });

    it("Stakeholder CRUD cancel", function () {
        let initialStakeholderName = data.getFullName();
        const stakeholder = new Stakeholders(data.getEmail(), initialStakeholderName);
        stakeholder.create(true);
        notExists(stakeholder.email, stakeHoldersTable);

        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email, stakeHoldersTable);

        stakeholder.edit({}, true);
        exists(initialStakeholderName, stakeHoldersTable);

        stakeholder.delete(true);
        exists(stakeholder.email, stakeHoldersTable);

        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");
    });

    it("Stakeholder CRUD operations with members (jobfunction and groups)", function () {
        let stakeHolderGroupNameList: Array<string> = [];
        for (let i = 0; i < 2; i++) {
            const jobfunction = new Jobfunctions(data.getJobTitle());
            jobfunction.create();
            jobFunctionsList.push(jobfunction);

            const stakeholderGroup = new Stakeholdergroups(
                data.getCompanyName(),
                data.getDescription()
            );
            stakeholderGroup.create();
            stakeholderGroupList.push(stakeholderGroup);
            stakeHolderGroupNameList.push(stakeholderGroup.name);
        }

        const stakeholder = new Stakeholders(
            data.getEmail(),
            data.getFullName(),
            jobFunctionsList[0].name,
            [stakeHolderGroupNameList[0]]
        );

        stakeholder.create();
        cy.wait("@postStakeholder");
        exists(stakeholder.email, stakeHoldersTable);

        stakeholder.edit({
            name: data.getFullName(),
            jobfunction: jobFunctionsList[1].name,
            groups: stakeHolderGroupNameList,
        });
        cy.wait("@postStakeholder");
        cy.wait("@getStakeholders");

        expandRowDetails(stakeholder.email);
        existsWithinRow(stakeholder.email, "div > dd", stakeHolderGroupNameList[1]);
        closeRowDetails(stakeholder.email);
        cy.get(tdTag).contains(stakeholder.email).siblings(groupsCount).should("contain", "1");

        stakeholder.delete();
        cy.wait("@deleteStakeholder");
        cy.wait("@getStakeholders");
        notExists(stakeholder.email, stakeHoldersTable);
    });

    after("Perform test data clean up", function () {
        deleteByList(jobFunctionsList);
        deleteByList(stakeholderGroupList);
    });
});
