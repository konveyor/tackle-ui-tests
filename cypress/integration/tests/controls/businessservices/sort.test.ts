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
} from "../../../../utils/utils";
import { navMenu, navTab } from "../../../views/menu.view";
import { controls, businessservices, name, owner } from "../../../types/constants";

import { Stakeholders } from "../../../models/stakeholders";
import * as data from "../../../../utils/data_utils";
import { BusinessServices } from "../../../models/businessservices";

var stakeholdersList: Array<Stakeholders> = [];
var businessservicesList: Array<BusinessServices> = [];
var businessserviceNames: Array<string> = [];

describe("Business services sort validations", function () {
    before("Login and Create Test Data", function () {
        // Perform login
        login();

        // Create multiple bussiness services and stakeholders
        for (let i = 0; i < 2; i++) {
            // Create new stakeholder
            const stakeholder = new Stakeholders(data.getEmail(), data.getFullName());
            stakeholder.create();
            stakeholdersList.push(stakeholder);

            // Create new business service
            const businessservice = new BusinessServices(
                data.getCompanyName(),
                data.getDescription(),
                stakeholder.name
            );
            businessservice.create();
            businessservicesList.push(businessservice);
            businessserviceNames.push(businessservice.name);
        }
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

        businessservicesList.forEach(function (businessservice) {
            businessservice.delete();
        });

        stakeholdersList.forEach(function (stakeholder) {
            stakeholder.delete();
        });
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
