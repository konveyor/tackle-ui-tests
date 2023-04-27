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
    createMultipleBusinessServices,
    deleteByList,
    exists,
    hasToBeSkipped,
    login,
    notExists,
    preservecookies,
    selectUserPerspective,
} from "../../../../../utils/utils";
describe("Business service CRUD operations", { tags: "@tier1" }, () => {
    let businessServiceList = [];
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
    });

    it("Business service CRUD", function () {
        // const businessService = new BusinessServices(data.getCompanyName(), data.getDescription());
        businessServiceList = createMultipleBusinessServices(3);
        deleteByList(businessServiceList);
    });
});
