/// <reference types="cypress" />

import {
    login,
    clickByText,
    sortAsc,
    sortDesc,
    verifySortAsc,
    verifySortDesc,
    getTableColumnData,
    preservecookies,
    hasToBeSkipped,
    createMultipleStakeholders,
    createMultipleBusinessServices,
    deleteAllBusinessServices,
    deleteAllStakeholders,
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, businessservices, name, owner } from "../../../types/constants";

import { Stakeholders } from "../../../models/stakeholders";
import { BusinessServices } from "../../../models/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var businessservicesList: Array<BusinessServices> = [];

describe("Business services sort validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        // Create data
        stakeholdersList = createMultipleStakeholders(2);
        businessservicesList = createMultipleBusinessServices(2, stakeholdersList);
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();

        // Interceptors
        cy.intercept("POST", "/api/controls/business-service*").as("postBusinessService");
        cy.intercept("GET", "/api/controls/business-service*").as("getBusinessService");
    });

    after("Perform test data clean up", function () {
        // Delete the bussiness services and stakeholders created before the tests

        deleteAllBusinessServices();
        deleteAllStakeholders();
    });

    it("Name sort validations", function () {
        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
        cy.wait("@getBusinessService");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(name);

        // Sort the business services by name in ascending order
        sortAsc(name);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(name);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by name in descending order
        sortDesc(name);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(name);
        verifySortDesc(afterDescSortList, unsortedList);
    });

    it("Owner sort validations", function () {
        // Navigate to business services tab
        clickByText(navMenu, controls);
        clickByText(navTab, businessservices);
        cy.wait("@getBusinessService");

        // get unsorted list when page loads
        const unsortedList = getTableColumnData(owner);

        // Sort the business services by owner in ascending order
        sortAsc(owner);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in ascending order
        const afterAscSortList = getTableColumnData(owner);
        verifySortAsc(afterAscSortList, unsortedList);

        // Sort the business services by owner in descending order
        sortDesc(owner);
        cy.wait(2000);

        // Verify that the business services table rows are displayed in descending order
        const afterDescSortList = getTableColumnData(owner);
        verifySortDesc(afterDescSortList, unsortedList);
    });
});
