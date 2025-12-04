import {
    clickByText,
    getUniqueElementsFromSecondArray,
    validateAnyNumberPresence,
    validateTextPresence,
} from "../../../../../utils/utils";
import { issueFilter, trTag } from "../../../../types/constants";
import { AppInsight } from "../../../../types/types";
import { liTag, span } from "../../../../views/common.view";
import { insightColumns, singleApplicationColumns } from "../../../../views/issue.view";
import { DynamicReports } from "../dynamic-report";

export class Insights extends DynamicReports {
    static urlSuffix = "/insights";
    static menuName = "Insights";

    public static applyAndValidateFilter(
        filterType: issueFilter,
        filterValues: string[],
        insightsExpected: AppInsight[],
        insightsNotExpected: AppInsight[] = [],
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
        const firstSource = insight.sources?.[0] ?? "None";
        const firstTarget = insight.targets?.[0] ?? "None";
        const hasMultipleTargets = (insight.targets?.length ?? 0) > 1;

        cy.contains(insight.name)
            .closest(trTag)
            .within(() => {
                validateTextPresence(insightColumns.insight, insight.name);
                validateTextPresence(insightColumns.category, insight.category);
                validateTextPresence(insightColumns.source, firstSource);

                if (firstTarget !== "None") {
                    cy.get(insightColumns.target).within(() => {
                        validateTextPresence(liTag, firstTarget);

                        if (hasMultipleTargets) {
                            clickByText(span, /more/i);
                        }
                    });
                } else {
                    validateTextPresence(insightColumns.target, "None");
                }

                if (!isSingle) {
                    validateAnyNumberPresence(insightColumns.applications);
                } else {
                    validateAnyNumberPresence(singleApplicationColumns.files);
                }
            });
    }
}
