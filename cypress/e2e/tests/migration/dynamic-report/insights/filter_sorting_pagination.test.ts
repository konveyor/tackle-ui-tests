import * as data from "../../../../../utils/data_utils";
import {
    clearAllFilters,
    createMultipleBusinessServices,
    createMultipleStakeholderGroups,
    createMultipleStakeholders,
    createMultipleTags,
    deleteByList,
    getRandomAnalysisData,
    getRandomApplicationData,
    login,
} from "../../../../../utils/utils";
import { Analysis } from "../../../../models/migration/applicationinventory/analysis";
import { Archetype } from "../../../../models/migration/archetypes/archetype";
import { BusinessServices } from "../../../../models/migration/controls/businessservices";
import { Stakeholdergroups } from "../../../../models/migration/controls/stakeholdergroups";
import { Stakeholders } from "../../../../models/migration/controls/stakeholders";
import { Tag } from "../../../../models/migration/controls/tags";
import { Insights } from "../../../../models/migration/dynamic-report/insights/insights";
import { AnalysisStatuses, issueFilter } from "../../../../types/constants";

describe(["@tier3"], "Filtering, sorting and pagination in Insights", function () {
    let applicationsList: Analysis[] = [];
    let businessServiceList: BusinessServices[];
    let archetype: Archetype;
    let stakeholders: Stakeholders[];
    let stakeholderGroups: Stakeholdergroups[];
    let tags: Tag[];
    let tagNames: string[];
    const appAmount = 1;

    let analysisData: any;
    let applicationData: any;

    before("Login, setup controls, and prepare applications for analysis", function () {
        Cypress.session.clearAllSavedSessions();
        login();
        cy.visit("/");

        cy.fixture("application").then((data) => {
            applicationData = data;
        });
        cy.fixture("analysis").then((data) => {
            analysisData = data;
        });

        stakeholders = createMultipleStakeholders(2);
        stakeholderGroups = createMultipleStakeholderGroups(2);
        businessServiceList = createMultipleBusinessServices(2);
        tags = createMultipleTags(2);
        tagNames = tags.map((tag) => tag.name);

        archetype = new Archetype(
            data.getRandomWord(8),
            [tagNames[0]],
            [tagNames[1]],
            null,
            stakeholders,
            stakeholderGroups
        );
        archetype.create();

        cy.then(() => {
            applicationsList = [];

            for (let i = 0; i < appAmount; i++) {
                const bookServerApp = new Analysis(
                    getRandomApplicationData("IssuesFilteringApp1_" + i, {
                        sourceData: applicationData["bookserver-app"],
                    }),
                    getRandomAnalysisData(analysisData["source_analysis_on_bookserverapp"])
                );
                bookServerApp.business = businessServiceList[0].name;
                applicationsList.push(bookServerApp);
            }

            for (let i = 0; i < appAmount; i++) {
                const coolstoreApp = new Analysis(
                    getRandomApplicationData("IssuesFilteringApp2_" + i, {
                        sourceData: applicationData["coolstore-app"],
                    }),
                    getRandomAnalysisData(analysisData["source+dep_on_coolStore_app"])
                );
                coolstoreApp.tags = tagNames;
                coolstoreApp.business = businessServiceList[1].name;
                applicationsList.push(coolstoreApp);
            }

            applicationsList.forEach((application) => application.create());
        });
    });

    it("should filter insights by application name and validate the result set", function () {
        const bookServerApp = applicationsList[0];
        const coolstoreApp = applicationsList[appAmount];

        const bookServerInsights = analysisData["source_analysis_on_bookserverapp"]["insights"];
        const coolstoreInsights = analysisData["source+dep_on_coolStore_app"]["insights"];

        Analysis.analyzeByList(applicationsList);
        Analysis.verifyAllAnalysisStatuses(AnalysisStatuses.completed);

        Insights.openList();

        Insights.applyAndValidateFilter(
            issueFilter.applicationName,
            [bookServerApp.name],
            bookServerInsights,
            coolstoreInsights
        );

        clearAllFilters();
    });

    after("Perform test data clean up", function () {
        cy.reload();
        deleteByList(applicationsList);
        archetype.delete();
        deleteByList(stakeholders);
        deleteByList(stakeholderGroups);
        deleteByList(tags);
        deleteByList(businessServiceList);
    });
});
