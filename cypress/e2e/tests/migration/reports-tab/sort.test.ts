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
    clickOnSortButton,
    createMultipleApplications,
    createMultipleStakeholders,
    deleteAllMigrationWaves,
    deleteApplicationTableRows,
    login,
    validateSortBy,
    verifySortAsc,
    verifySortDesc,
} from "../../../../utils/utils";
import { legacyPathfinder, SEC, SortType } from "../../../types/constants";
import { Stakeholders } from "../../../models/migration/controls/stakeholders";
import { Application } from "../../../models/migration/applicationinventory/application";
import { AssessmentQuestionnaire } from "../../../models/administration/assessment_questionnaire/assessment_questionnaire";
import { Reports } from "../../../models/migration/reports-tab/reports-tab";
import {
    IdentifiedRiskTableHeaders,
    questionnaireNameColumnDataLabel,
} from "../../../views/reportsTab.view";

let stakeholder: Stakeholders;
let application: Application;

const sortableColumns = [
    IdentifiedRiskTableHeaders.questionnaireName,
    IdentifiedRiskTableHeaders.section,
    IdentifiedRiskTableHeaders.answer,
];

// Automates Polarion TCs 452
describe(["@tier2"], "Reports tab sort tests", () => {
    before("Login and Create Test Data", function () {
        login();
        deleteAllMigrationWaves();
        deleteApplicationTableRows();
        AssessmentQuestionnaire.deleteAllQuestionnaires();
        AssessmentQuestionnaire.enable(legacyPathfinder);
        stakeholder = createMultipleStakeholders(1)[0];
        application = createMultipleApplications(1)[0];
        application.perform_assessment("high", [stakeholder]);
        application.verifyStatus("assessment", "Completed");
        application.perform_review("high");
        application.verifyStatus("review", "Completed");
        Reports.open(100);
    });

    sortableColumns.forEach((column: string) => {
        it(`${column} sort validations`, function () {
            let columnDataLabel = column;
            if (column === (IdentifiedRiskTableHeaders.questionnaireName as string)) {
                columnDataLabel = questionnaireNameColumnDataLabel;
            }

            validateSortBy(column, columnDataLabel);
        });
    });

    it("Risk sort validation", function () {
        const unsorted = getRiskIconColumnSortableData();
        clickOnSortButton(IdentifiedRiskTableHeaders.risk, SortType.ascending);
        verifySortAsc(getRiskIconColumnSortableData(), unsorted);

        clickOnSortButton(IdentifiedRiskTableHeaders.risk, SortType.descending);
        verifySortDesc(getRiskIconColumnSortableData(), unsorted);
    });

    after("Perform test data clean up", function () {
        stakeholder.delete();
        application.delete();
    });
});

/**
 * Since the icons don't have any text in them, the only way to sort them is by using their classes
 * As the classes are "warning", "danger" and "success" they cannot be sorted alphabetically
 * This approach retrieves the icon class and maps it to a letter, so it can be sortable alphabetically
 */
const getRiskIconColumnSortableData = (): string[] => {
    const itemList = [];

    cy.get(".pf-v5-c-table > tbody > tr", { timeout: 5 * SEC })
        .not(".pf-v5-c-table__expandable-row")
        .find(`td[data-label="${IdentifiedRiskTableHeaders.risk}"] span.pf-v5-c-icon__content`)
        .each(($ele) => {
            let letter = "a";
            switch ($ele.attr("class").split(" ").pop()) {
                case "pf-m-warning":
                    letter = "b";
                    break;
                case "pf-m-danger":
                    letter = "c";
                    break;
            }
            itemList.push(letter);
        });

    return itemList;
};
