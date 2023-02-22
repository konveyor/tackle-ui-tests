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
import {
    actionsButton,
    analysis,
    analyzeAppButton,
    analyzeButton,
    applicationInventory,
    button,
    save,
    SEC,
    tdTag,
    trTag,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import {
    cancelForm,
    click,
    clickByText,
    clickWithin,
    doesExistSelector,
    doesExistText,
    inputText,
    performRowActionByIcon,
    selectFormItems,
    selectUserPerspective,
    uploadApplications,
    uploadXml,
} from "../../../../utils/utils";
import { analysisData, applicationData, RbacValidationRules } from "../../../types/types";
import { Application } from "./application";
import {
    addButton,
    addRules,
    analysisColumn,
    analyzeManuallyButton,
    enableTransactionAnalysis,
    enterPackageName,
    enterPackageNameToExclude,
    excludePackagesSwitch,
    expandAll,
    fileName,
    manageCredentials,
    mavenCredential,
    nextButton,
    panelBody,
    reportStoryPoints,
    sourceCredential,
    sourceDropdown,
    tabsPanel,
} from "../../../views/analysis.view";
import { kebabMenu } from "../../../views/applicationinventory.view";
import { AnalysisStatuses } from "../../../types/constants";

export class Analysis extends Application {
    name: string;
    source: string;
    target: string[];
    binary?: string[];
    scope?: string;
    excludePackages?: string[];
    customRule?: string;
    sources?: string;
    excludeRuleTags?: string;
    enableTransaction?: boolean;
    appName?: string;
    storyPoints?: number;
    manuallyAnalyzePackages?: string[];
    excludedPackagesList?: string[];
    incidents?: {
        mandatory?: number;
        optional?: number;
        potential?: number;
        information?: number;
        total?: number;
    };

    constructor(appData: applicationData, analysisData: analysisData) {
        super(appData);
        this.initAnalysis(appData, analysisData);
    }

    protected initAnalysis(appData: applicationData, analysisData: analysisData) {
        const {
            source,
            target,
            binary,
            scope,
            excludePackages,
            customRule,
            sources,
            excludeRuleTags,
            enableTransaction,
            appName,
            storyPoints,
            manuallyAnalyzePackages,
            excludedPackagesList,
            incidents,
        } = analysisData;
        this.name = appData.name;
        this.source = source;
        this.target = target;
        if (binary) this.binary = binary;
        if (scope) this.scope = scope;
        if (customRule) this.customRule = customRule;
        if (sources) this.sources = sources;
        if (excludeRuleTags) this.excludeRuleTags = excludeRuleTags;
        if (enableTransaction) this.enableTransaction = enableTransaction;
        if (appName) this.appName = appName;
        if (storyPoints) this.storyPoints = storyPoints;
        if (excludePackages) this.excludePackages = excludePackages;
        if (manuallyAnalyzePackages) this.manuallyAnalyzePackages = manuallyAnalyzePackages;
        if (excludedPackagesList) this.excludedPackagesList = excludedPackagesList;
        if (incidents) this.incidents = incidents;
    }

    //Navigate to the Application inventory
    public static open(): void {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, analysis);
        cy.wait(10000);
    }

    create(): void {
        Analysis.open();
        super.create();
    }

    protected selectSourceofAnalysis(source: string): void {
        selectFormItems(sourceDropdown, source);
    }

    protected selectTarget(target: string[]): void {
        for (let i = 0; i < target.length; i++) {
            cy.get("div.pf-c-empty-state__content").children("h4").contains(target[i]).click();
        }
    }

    protected uploadBinary() {
        this.binary.forEach((binaryList) => {
            uploadApplications(binaryList);
            cy.get("span.pf-c-progress__measure", { timeout: 5000 * SEC }).should(
                "contain",
                "100%"
            );
        });
    }

    protected enableTransactionAnalysis() {
        cy.get(enableTransactionAnalysis).click();
    }

    protected uploadCustomRule() {
        cy.contains("button", "Add rules", { timeout: 20000 }).should("be.enabled").click();
        uploadXml("xml/" + this.customRule);
        cy.wait(2000);
        cy.get("span.pf-c-progress__measure", { timeout: 150000 }).should("contain", "100%");
        cy.wait(2000);
        cy.contains(addRules, "Add", { timeout: 2000 }).click();
    }

    protected isNextEnabled() {
        cy.get(nextButton).then(($a) => {
            if ($a.hasClass("pf-m-disabled")) {
                cy.wait(2000);
                this.isNextEnabled();
            }
        });
    }

    protected scopeSelect() {
        if (this.manuallyAnalyzePackages) {
            // for Scope's "Select the list of packages to be analyzed manually" option
            click(analyzeManuallyButton);
            inputText(enterPackageName, this.manuallyAnalyzePackages);
            clickByText(addButton, "Add");
            click(excludePackagesSwitch);
            inputText(enterPackageName, this.manuallyAnalyzePackages);
            clickByText(addButton, "Add");
        }
        if (this.excludePackages) {
            click(excludePackagesSwitch);
            inputText(enterPackageNameToExclude, this.excludePackages);
            clickByText(addButton, "Add");
        }
        cy.contains("button", "Next", { timeout: 200 }).click();
    }

    protected tagsToExclude() {
        inputText("#ruleTagToExclude", this.excludeRuleTags);
        clickByText("#add-package-to-include", "Add");
    }

    analyze(cancel = false): void {
        Analysis.open();
        this.selectApplication();
        cy.contains("button", analyzeButton, { timeout: 20000 }).should("be.enabled").click();
        if (cancel) {
            cancelForm();
        } else {
            this.selectSourceofAnalysis(this.source);
            if (this.binary) this.uploadBinary();
            this.isNextEnabled();
            cy.contains("button", "Next", { timeout: 200 }).click();
            this.selectTarget(this.target);
            cy.contains("button", "Next", { timeout: 200 }).click();
            this.scopeSelect();
            if (this.customRule) this.uploadCustomRule();
            cy.contains("button", "Next", { timeout: 200 }).click();
            if (this.excludeRuleTags) this.tagsToExclude();
            if (this.enableTransaction) this.enableTransactionAnalysis();
            if (!this.sources) cy.contains("button", "Next", { timeout: 200 }).click();
            cy.contains("button", "Run", { timeout: 200 }).click();
            // checkSuccessAlert(commonView.successAlertMessage, `Submitted for analysis`);
            // Commented the line because of the BZ https://issues.redhat.com/browse/TACKLE-890
        }
    }

    static validateAnalyzeButton(rbacRules: RbacValidationRules) {
        Analysis.open();
        doesExistSelector(analyzeAppButton, rbacRules["Analyze"]);
    }

    verifyAnalysisStatus(status) {
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                cy.get(analysisColumn)
                    .find("div > div:nth-child(2)", { timeout: 10800000 }) // 3h
                    .should("not.have.text", AnalysisStatuses.notStarted)
                    .and("not.have.text", AnalysisStatuses.scheduled)
                    .and("not.have.text", AnalysisStatuses.inProgress)
                    .then(($a) => {
                        const currentStatus = $a.text().toString() as AnalysisStatuses;
                        if (currentStatus != status) {
                            // If analysis failed and is not expected then test fails.
                            if (
                                currentStatus == AnalysisStatuses.failed &&
                                status != AnalysisStatuses.failed
                            ) {
                                expect(currentStatus).to.eq(AnalysisStatuses.completed);
                            }
                        } else {
                            expect(currentStatus).to.eq(status);
                        }
                    });
            });
    }

    openreport() {
        super.expandApplicationRow();
        cy.wait(10000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .next()
            .find("span")
            .contains("Analysis")
            .parent("dt")
            .next()
            .within(() => {
                cy.get("button > a")
                    .should("contain", "Report")
                    .then(($a) => {
                        // Removing target from html so that report opens in same tab
                        $a.attr("target", "_self");
                    })
                    .click();
            });
    }

    openAnalysisDetails() {
        super.expandApplicationRow();
        cy.wait(10000);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .next()
            .find("span")
            .contains("Analysis")
            .parent("dt")
            .next()
            .within(() => {
                cy.get("button.pf-c-button.pf-m-link.pf-u-ml-0")
                    .should("contain", "Analysis details")
                    .then(($a) => {
                        // Removing target from html so that report opens in same tab
                        $a.attr("target", "_self");
                    })
                    .click();
            });
    }

    delete(cancel = false): void {
        Analysis.open();
        super.delete();
    }

    manageCredentials(sourceCred?: string, mavenCred?: string): void {
        cy.wait(2000);
        performRowActionByIcon(this.name, kebabMenu);
        clickByText(button, manageCredentials);
        if (sourceCred) {
            selectFormItems(sourceCredential, sourceCred);
        }
        if (mavenCred) {
            selectFormItems(mavenCredential, mavenCred);
        }
        clickByText(button, save);
        cy.wait(2000);
    }

    validateStoryPoints(): void {
        cy.get(fileName).should("contain", this.appName);
        cy.get(reportStoryPoints).should("contain", this.storyPoints);
    }

    validateTransactionReport(): void {
        cy.get(fileName + " > a")
            .should("contain", this.appName)
            .click();
        cy.get(tabsPanel).contains("Transactions").click();
        cy.get("div[class='main']").should("contain", "Transactions Report");
    }

    validateExcludedPackages(text?: string): void {
        // Click on App name
        // then Application Details tab
        // and the html link to exclude packages should not be present
        cy.get(fileName + " > a")
            .should("contain", this.appName)
            .click();
        cy.get(tabsPanel).contains("Application Details").click();
        click(expandAll);
        if (this.excludePackages) {
            cy.get(panelBody).should("not.contain.html", `${this.excludePackages}.${text}`);
        }
        if (this.manuallyAnalyzePackages) {
            // for "Select the list of packages to be analyzed manually" option
            cy.get(panelBody).should("not.contain.html", this.excludedPackagesList);
        }
    }

    static validateTopActionMenu(rbacRules: RbacValidationRules) {
        Analysis.open();
        if (rbacRules["Action menu"]["Not available"]) {
            cy.get(".pf-c-toolbar__content-section").within(() => {
                doesExistSelector(actionsButton, false);
            });
        } else {
            clickWithin(".pf-c-toolbar__content-section", actionsButton);
            doesExistText("Import", rbacRules["Action menu"]["Import"]);
            doesExistText("Manage imports", rbacRules["Action menu"]["Manage imports"]);
            doesExistText("Manage credentials", rbacRules["Action menu"]["Manage credentials"]);
            doesExistText("Delete", rbacRules["Action menu"]["Delete"]);
        }
    }

    validateExcludedTags(): void {
        // Click on App name
        // then Application Details tab
        // Excluded Tags should not be present
        cy.get(fileName + " > a")
            .should("contain", this.appName)
            .click();
        cy.get(tabsPanel).contains("Application Details").click();
        click(expandAll);
        cy.get(panelBody).should("not.contain.text", this.excludeRuleTags);
    }

    // Method to validate Incidents on report page
    validateIncidents(): void {
        cy.get("div[class='incidentsCount'] > table > tbody").as("incidentTable");
        cy.get("@incidentTable")
            .find("tr")
            .each(($row) => {
                const label = $row.find("td.label_").text();
                const count = $row.find("td.count").text();
                let index = 0;
                if (label.includes("Mandatory")) {
                    expect(this.incidents[index].mandatory).equal(Number(count));
                }
                if ($row.children("td.label_").text().includes("Optional")) {
                    expect(this.incidents[index].optional).equal(
                        Number($row.children("td.count").text())
                    );
                }
                if (label.includes("Potential")) {
                    expect(this.incidents[index].potential).equal(Number(count));
                }
                if (label.includes("Information")) {
                    expect(this.incidents[index].information).equal(Number(count));
                }
            });
    }
}
