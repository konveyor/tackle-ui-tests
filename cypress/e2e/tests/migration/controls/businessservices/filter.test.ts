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
    applySearchFilter,
    clickByText,
    createMultipleBusinessServices,
    createMultipleStakeholders,
    deleteByList,
    exists,
    login,
    notExists,
} from "../../../../../utils/utils";
import { button, clearAllFilters, createdBy, description, name } from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";

let businessServicesList: Array<BusinessServices> = [];
let stakeholdersList: Array<Stakeholders> = [];
let invalidSearchInput = String(data.getRandomNumber());

describe(["@tier3"], "Business services filter validations", function () {
    before("Login and Create Test Data", function () {
        login();
        cy.visit("/");
        stakeholdersList = createMultipleStakeholders(3);
        businessServicesList = createMultipleBusinessServices(2, stakeholdersList);
    });

    it("Name filter validations", function () {
        BusinessServices.openList();

        // Enter an existing display name substring and assert
        let validSearchInput = businessServicesList[0].name.substring(0, 3);
        applySearchFilter(name, validSearchInput);
        exists(businessServicesList[0].name);

        if (businessServicesList[1].name.indexOf(validSearchInput) >= 0) {
            exists(businessServicesList[1].name);
        }
        clickByText(button, clearAllFilters);

        // Enter an existing exact name and assert
        applySearchFilter(name, businessServicesList[1].name);
        exists(businessServicesList[1].name);
        notExists(businessServicesList[0].name);

        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);
        cy.get("h2").contains("No business service available");
        clickByText(button, clearAllFilters);
    });

    it("Description filter validations", function () {
        BusinessServices.openList();

        // Enter an existing description substring and assert
        let validSearchInput = businessServicesList[0].description.substring(0, 8);
        applySearchFilter(description, validSearchInput);
        exists(businessServicesList[0].description);

        if (businessServicesList[1].description.indexOf(validSearchInput) >= 0) {
            exists(businessServicesList[1].description);
        }
        clickByText(button, clearAllFilters);

        // Enter an existing exact description and assert
        applySearchFilter(description, businessServicesList[1].description);
        exists(businessServicesList[1].description);
        notExists(businessServicesList[0].description);

        clickByText(button, clearAllFilters);

        // Enter a non-existing description substring and apply it as search filter
        applySearchFilter(description, invalidSearchInput);
        cy.get("h2").contains("No business service available");
        clickByText(button, clearAllFilters);
    });

    it("Owner filter validations", function () {
        BusinessServices.openList();

        // Enter an existing owner substring and assert
        let validSearchInput = businessServicesList[0].owner.substring(0, 3);
        applySearchFilter(createdBy, validSearchInput);
        exists(businessServicesList[0].owner);

        if (businessServicesList[1].owner.indexOf(validSearchInput) >= 0) {
            exists(businessServicesList[1].owner);
        }
        clickByText(button, clearAllFilters);

        // Enter an existing exact owner and assert
        applySearchFilter(createdBy, businessServicesList[1].owner);
        exists(businessServicesList[1].owner);
        notExists(businessServicesList[0].owner);

        clickByText(button, clearAllFilters);

        // Enter a non-attached owner substring and apply it as search filter
        applySearchFilter(createdBy, stakeholdersList[2].name);
        cy.get("h2").contains("No business service available");
        clickByText(button, clearAllFilters);
    });

    after("Perform test data clean up", function () {
        deleteByList(businessServicesList);
        deleteByList(stakeholdersList);
    });
});
