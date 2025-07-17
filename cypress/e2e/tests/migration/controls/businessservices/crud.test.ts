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

import { exists, notExists } from "../../../../../utils/utils";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";

import * as data from "../../../../../utils/data_utils";

export function businessServiceCRUD() {
    beforeEach("Interceptors", function () {
        cy.intercept("POST", "/hub/businessservices*").as("postBusinessService");
        cy.intercept("GET", "/hub/businessservices*").as("getBusinessService");

        cy.intercept("POST", "/hub/stakeholders*").as("postStakeholder");
        cy.intercept("GET", "/hub/stakeholders*").as("getStakeholders");
    });

    it("Business service CRUD", function () {
        const businessService = new BusinessServices(data.getCompanyName(), data.getDescription());
        businessService.create();
        exists(businessService.name);

        let updatedBusinessServiceName = data.getCompanyName();
        businessService.edit({ name: updatedBusinessServiceName });
        exists(updatedBusinessServiceName);

        businessService.delete();
        notExists(businessService.name);
    });
}
