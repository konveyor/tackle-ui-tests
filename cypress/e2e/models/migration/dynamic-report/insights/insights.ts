import {
    clickByText,
    getUniqueElementsFromSecondArray,
    validateAnyNumberPresence,
    validateTextPresence,
} from "../../../../../utils/utils";
import { DynamicReports } from "../../../../tests/migration/dynamic-report/dynamic-report";
import { issueFilter, trTag } from "../../../../types/constants";
import { AppInsight } from "../../../../types/types";
import { liTag, span } from "../../../../views/common.view";
import { insightColumns, singleApplicationColumns } from "../../../../views/issue.view";

export class Insights extends DynamicReports {
    static urlSuffix = "/insights";
    static menuName = "Insights";

    public static applyAndValidateFilter(
        filterType: issueFilter,
        filterValues: string[],
        insightsExpected: AppInsight[],
        insightsNotExpected?: AppInsight[],
        isSingle = false
    ) {
        filterValues.forEach((value) => {
            Insights.applyFilter(filterType, value, isSingle);
        });
        insightsExpected.forEach((insight) => {
            Insights.validateFilter(insight, isSingle);
        });

        if (insightsNotExpected.length > 0) {
            getUniqueElementsFromSecondArray(insightsExpected, insightsNotExpected).forEach(
                (insight: AppInsight) => {
                    validateTextPresence(insightColumns.insight, insight.name, false);
                }
            );
        }
    }

    public static validateFilter(insight: AppInsight, isSingle = false): void {
        cy.contains(insight.name)
            .closest(trTag)
            .within(() => {
                validateTextPresence(insightColumns.insight, insight.name);
                validateTextPresence(insightColumns.category, insight.category);
                validateTextPresence(insightColumns.source, insight.sources[0]);
                if (insight.targets[0] != "None") {
                    cy.get(insightColumns.target).within(() => {
                        validateTextPresence(liTag, insight.targets[0]);
                        if (insight.targets.length > 1) {
                            clickByText(span, /more/i);
                        }
                    });
                } else {
                    validateTextPresence(insightColumns.target, insight.targets[0]);
                }
                if (!isSingle) {
                    validateAnyNumberPresence(insightColumns.applications);
                } else {
                    validateAnyNumberPresence(singleApplicationColumns.files);
                }
            });
    }
}
