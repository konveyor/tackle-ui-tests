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
    cancelForm,
    click,
    clickByText,
    clickItemInKebabMenu,
    clickTab,
    clickWithin,
    clickWithinByText,
    doesExistSelector,
    doesExistText,
    inputText,
    next,
    selectCheckBox,
    selectFormItems,
    sidedrawerTab,
    uploadApplications,
    uploadXml,
} from "../../../../utils/utils";
import {
    AnalysisStatuses,
    analyzeAppButton,
    analyzeButton,
    button,
    clearAllFilters,
    Languages,
    MIN,
    ReportTypeSelectors,
    RepositoryType,
    save,
    SEC,
    tdTag,
    trTag,
} from "../../../types/constants";
import {
    analysisData,
    applicationData,
    RbacValidationRules,
    RulesRepositoryFields,
} from "../../../types/types";
import {
    addButton,
    addRules,
    analysisColumn,
    analysisDetails,
    analyzeManuallyButton,
    camelToggleButton,
    closeWizard,
    dropDownMenu,
    effortColumn,
    enableAutomatedTagging,
    enableTransactionAnalysis,
    enterPackageName,
    enterPackageNameToExclude,
    excludePackagesSwitch,
    expandAll,
    fileName,
    kebabTopMenuButton,
    languageSelectionDropdown,
    manageCredentials,
    mavenCredential,
    numberOfRulesColumn,
    openjdkToggleButton,
    panelBody,
    rightSideMenu,
    sourceCredential,
    sourceDropdown,
    tabsPanel,
} from "../../../views/analysis.view";
import { bulkApplicationSelectionCheckBox } from "../../../views/applicationinventory.view";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { Application } from "./application";

export class Analysis extends Application {
    name: string;
    source: string;
    target: string[];
    binary?: string[];
    scope?: string;
    excludePackages?: string[];
    customRule?: string[];
    customRuleRepository?: RulesRepositoryFields;
    sources?: string;
    excludeRuleTags?: string;
    enableTransaction?: boolean;
    disableTagging?: boolean;
    appName?: string;
    effort?: number;
    manuallyAnalyzePackages?: string[];
    excludedPackagesList?: string[];
    openSourceLibraries?: boolean;
    language: Languages = Languages.Java;
    incidents?: {
        mandatory?: number;
        optional?: number;
        potential?: number;
        information?: number;
        total?: number;
    };
    ruleFileToQuantity?: { [id: string]: number };

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
            disableTagging,
            appName,
            effort,
            manuallyAnalyzePackages,
            excludedPackagesList,
            incidents,
            openSourceLibraries,
            customRuleRepository,
            language,
            ruleFileToQuantity,
        } = analysisData;
        this.name = appData.name;
        this.source = source;
        this.target = target;
        if (binary) this.binary = binary;
        if (scope) this.scope = scope;
        if (customRule) this.customRule = customRule;
        if (customRuleRepository) this.customRuleRepository = customRuleRepository;
        if (sources) this.sources = sources;
        if (excludeRuleTags) this.excludeRuleTags = excludeRuleTags;
        if (enableTransaction) this.enableTransaction = enableTransaction;
        if (disableTagging) this.disableTagging = disableTagging;
        if (appName) this.appName = appName;
        if (effort) this.effort = effort;
        if (excludePackages) this.excludePackages = excludePackages;
        if (manuallyAnalyzePackages) this.manuallyAnalyzePackages = manuallyAnalyzePackages;
        if (excludedPackagesList) this.excludedPackagesList = excludedPackagesList;
        if (incidents) this.incidents = incidents;
        if (openSourceLibraries) this.openSourceLibraries = openSourceLibraries;
        if (language) this.language = language;
        if (ruleFileToQuantity) this.ruleFileToQuantity = ruleFileToQuantity;
    }

    public selectSourceofAnalysis(source: string): void {
        selectFormItems(sourceDropdown, source);
    }

    /**
     * Make sure our language is selected. It may already be selected if language-discovery
     * added it, or if it was added manually.
     */
    public static selectLanguage(language: Languages, removePreSelected = false) {
        cy.wait(2 * SEC);
        if (removePreSelected) {
            clickWithinByText(".pf-v5-c-wizard__main-body", "button", clearAllFilters);
        }

        cy.get(languageSelectionDropdown).click();

        cy.get(`#filter-control-provider-select-typeahead-listbox > li`)
            .contains(language)
            .closest(".pf-v5-c-menu__list-item")
            .find("input[type=checkbox]")
            .check();

        cy.get(languageSelectionDropdown).click();
    }

    public selectTarget(target: string[]): void {
        for (let i = 0; i < target.length; i++) {
            if (["OpenJDK 11", "OpenJDK 17", "OpenJDK 21"].includes(target[i])) {
                click(openjdkToggleButton);
                clickByText(dropDownMenu, target[i]);
                click(`#target-OpenJDK-select`);
            } else if (["camel:3", "camel:4"].includes(target[i])) {
                click(camelToggleButton);
                clickByText(dropDownMenu, target[i]);
                click(`#target-Camel-select`);
            } else {
                click(`#target-${target[i].replace(/ /g, "-")}-select`);
            }
        }
    }

    protected uploadBinary() {
        this.binary.forEach((binaryList) => {
            uploadApplications(binaryList);
            cy.get("span.pf-v5-c-progress__measure", { timeout: 5000 * SEC }).should(
                "contain",
                "100%"
            );
        });
    }

    protected enableTransactionAnalysis() {
        cy.get(enableTransactionAnalysis)
            .invoke("is", ":checked")
            .then((checked) => {
                checked
                    ? cy.log("Box is already checked")
                    : cy.get(enableTransactionAnalysis).check();
            });
    }

    protected disableAutomatedTagging() {
        cy.get(enableAutomatedTagging)
            .invoke("is", ":checked")
            .then((checked) => {
                checked
                    ? cy.get(enableAutomatedTagging).uncheck()
                    : cy.log("Box is already unchecked");
            });
    }

    protected uploadCustomRule() {
        for (let i = 0; i < this.customRule.length; i++) {
            cy.contains("button", "Add rules", { timeout: 20000 }).should("be.enabled").click();
            const folder = this.customRule[i].split(".").pop();
            uploadXml(`${folder}/${this.customRule[i]}`);
            cy.wait(2000);
            cy.get("span.pf-v5-c-progress__measure", { timeout: 150000 }).should("contain", "100%");
            cy.wait(2000);
            cy.contains(addRules, "Add", { timeout: 2000 }).click();
        }
    }

    protected fetchCustomRules() {
        cy.contains("button", "Repository", { timeout: 2000 }).should("be.enabled").click();
        click(CustomMigrationTargetView.repositoryTypeDropdown);
        clickByText(button, RepositoryType.git);

        inputText(CustomMigrationTargetView.repositoryUrl, this.customRuleRepository.repositoryUrl);

        if (this.customRuleRepository.branch) {
            inputText(CustomMigrationTargetView.branch, this.customRuleRepository.branch);
        }

        if (this.customRuleRepository.rootPath) {
            inputText(CustomMigrationTargetView.rootPath, this.customRuleRepository.rootPath);
        }

        if (this.customRuleRepository.credentials) {
            click(CustomMigrationTargetView.credentialsDropdown);
            clickByText(button, this.customRuleRepository.credentials.name);
        }
    }

    protected isNextEnabled() {
        cy.contains(button, "Next", { timeout: 300 * SEC }).should(
            "not.have.class",
            "pf-m-disabled"
        );
    }

    protected scopeSelect() {
        if (this.manuallyAnalyzePackages) {
            // for Scope's "Select the list of packages to be analyzed manually" option
            click(analyzeManuallyButton);
            inputText(enterPackageName, this.manuallyAnalyzePackages);
            clickByText(addButton, "Add");
        }

        if (this.excludePackages) {
            click(excludePackagesSwitch);
            inputText(enterPackageNameToExclude, this.excludePackages);
            clickByText(addButton, "Add");
        }

        if (this.openSourceLibraries) {
            click("#oss");
        }
        next();
    }

    protected tagsToExclude() {
        inputText("#ruleTagToExclude", this.excludeRuleTags);
        clickByText("#add-package-to-include", "Add");
    }

    analyze(cancel = false): void {
        Application.open();
        this.selectApplication();
        if (cancel) {
            cancelForm();
            return;
        }

        this.startAnalysis();
    }

    private startAnalysis() {
        cy.contains(button, analyzeButton).should("be.enabled").click();
        this.selectSourceofAnalysis(this.source);
        if (this.binary) this.uploadBinary();
        this.isNextEnabled();
        next();
        Analysis.selectLanguage(this.language);
        cy.wait(2 * SEC);
        this.selectTarget(this.target);
        next();
        this.scopeSelect();
        if (this.customRule) {
            this.uploadCustomRule();
        }
        if (this.customRuleRepository) {
            this.fetchCustomRules();
        }
        next();
        if (this.excludeRuleTags) {
            this.tagsToExclude();
        }
        if (this.enableTransaction) {
            this.enableTransactionAnalysis();
        }
        if (this.disableTagging) {
            this.disableAutomatedTagging();
        }
        if (!this.sources) {
            next();
        }
        clickByText(button, "Run");
    }

    public static analyzeAll(params: Analysis): void {
        Application.open();
        selectCheckBox(bulkApplicationSelectionCheckBox);
        params.startAnalysis();
    }

    public static analyzeByList(analysisList: Analysis[]): void {
        Application.open();
        analysisList.forEach((currentApp) => {
            currentApp.selectApplication();
        });
        analysisList[0].startAnalysis();
        analysisList.forEach((currentApp) => {
            currentApp.selectApplication();
        });
    }

    static validateAnalyzeButton(rbacRules: RbacValidationRules) {
        Application.open();
        doesExistSelector(analyzeAppButton, rbacRules["Analyze"]);
    }

    verifyAnalysisStatus(status: string, timeout?: number) {
        cy.log(`Verifying analysis status, expecting ${status}`);
        cy.get(tdTag, { log: false })
            .contains(this.name, { log: false })
            .closest(trTag, { log: false })
            .within(() => {
                Analysis.verifyStatus(cy.get(analysisColumn, { log: false }), status, timeout);
            });
        this.selectApplication();
    }

    public verifyEffort(effort: number) {
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                cy.get(effortColumn).should("contain", `${effort}`);
            });
    }

    public static verifyAllAnalysisStatuses(status: string) {
        cy.log(`Verifying all analysis statuses, expecting ${status}`);
        cy.get(analysisColumn, { log: false }).each(($el) => {
            Analysis.verifyStatus(cy.wrap($el), status);
        });
    }

    public static verifyStatus(element: Cypress.Chainable, status: string, timeout = 10 * MIN) {
        element
            .find("div > div:nth-child(2)", { timeout: timeout, log: false })
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
                        expect(currentStatus).to.include(AnalysisStatuses.completed);
                    }
                } else {
                    expect(currentStatus).to.include(status);
                }
            });
    }

    openReport() {
        sidedrawerTab(this.name, "Reports");
        clickByText(button, "View analysis details");
        cy.wait(2 * SEC);
    }

    downloadReport(type: ReportTypeSelectors) {
        Application.open();
        this.selectApplicationRow();
        cy.get(rightSideMenu, { timeout: 30 * SEC }).within(() => {
            clickTab("Reports");
            click(type);
            // waits until the file is downloaded
            cy.get(type, { timeout: 30 * SEC });
            const extension = type === ReportTypeSelectors.YAML ? "yaml" : "tar";
            cy.verifyDownload(`analysis-report-app-${this.name}.${extension}`);
        });
        this.closeApplicationDetails();
    }

    openAnalysisDetails() {
        cy.wait(2000);
        sidedrawerTab(this.name, "Reports");
        clickByText(button, analysisDetails);
        cy.wait(2 * SEC);
    }

    manageCredentials(sourceCred?: string, mavenCred?: string): void {
        cy.wait(2 * SEC);
        clickItemInKebabMenu(this.name, manageCredentials);
        if (sourceCred) {
            selectFormItems(sourceCredential, sourceCred);
        }
        if (mavenCred) {
            selectFormItems(mavenCredential, mavenCred);
        }
        clickByText(button, save);
        cy.wait(2000);
    }

    static validateTopActionMenu(rbacRules: RbacValidationRules) {
        Application.open();
        if (rbacRules["Top action menu"]["Not available"]) {
            cy.get(".pf-v5-c-page__main-section")
                .eq(1)
                .within(() => {
                    doesExistSelector(kebabTopMenuButton, false);
                });
        } else {
            cy.wait(SEC);

            cy.get(".pf-v5-c-page__main-section")
                .eq(1)
                .within(() => {
                    clickWithin(kebabTopMenuButton, button);
                });
            doesExistText("Import", rbacRules["Top action menu"]["Import"]);
            doesExistText("Manage imports", rbacRules["Top action menu"]["Manage imports"]);
            doesExistText("Manage credentials", rbacRules["Top action menu"]["Manage credentials"]);
            doesExistText("Delete", rbacRules["Top action menu"]["Delete"]);
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

    verifyFileNotValidXML(): void {
        this.selectApplication();
        cy.contains(button, analyzeButton).should("be.enabled").click();
        this.selectSourceofAnalysis(this.source);
        next();
        next();
        next();
        for (let i = 0; i < this.customRule.length; i++) {
            cy.contains("button", "Add rules", { timeout: 20000 }).should("be.enabled").click();
            const folder = this.customRule[i].split(".").pop();
            uploadXml(`${folder}/${this.customRule[i]}`);
            cy.wait(2000);
            cy.get("span.pf-v5-c-progress__measure", { timeout: 150000 }).should("contain", "100%");
            cy.wait(2000);
            cy.get("h4.pf-v5-c-alert__title").should(
                "contain.text",
                `Error: File "${this.customRule[i]}" is not a valid XML: `
            );
            cy.contains(addRules, "Add", { timeout: 2000 }).should("not.be.enabled");
        }
        cy.get(closeWizard).click({ force: true });
    }

    // verifyRulesNumber verifies the number of rules found in an uploaded custom rules file
    public verifyRulesNumber(): void {
        Application.open();
        this.selectApplication();
        cy.contains(button, analyzeButton).should("be.enabled").click();
        this.selectSourceofAnalysis(this.source);
        next();
        next();
        next();
        this.uploadCustomRule();
        for (let fileName in this.ruleFileToQuantity) {
            const numOfrules = this.ruleFileToQuantity[fileName];
            cy.get(trTag)
                .filter(':contains("' + fileName + '")')
                .within(() => {
                    cy.get(numberOfRulesColumn).contains(numOfrules.toString());
                });
        }
        cy.get(closeWizard).click({ force: true });
    }

    cancelAnalysis(): void {
        clickItemInKebabMenu(this.name, "Cancel analysis");
    }
}
