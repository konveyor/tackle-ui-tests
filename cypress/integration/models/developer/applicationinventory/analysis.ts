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
    applicationInventory,
    analyzeButton,
    analysis,
    tdTag,
    trTag,
    button,
    save,
    SEC,
} from "../../../types/constants";
import { navMenu, navTab } from "../../../views/menu.view";
import * as commonView from "../../../views/common.view";
import {
    clickByText,
    cancelForm,
    selectFormItems,
    checkSuccessAlert,
    selectUserPerspective,
    performRowActionByIcon,
    uploadXml,
    uploadApplications,
} from "../../../../utils/utils";
import { analysisData, applicationData } from "../../../types/types";
import { Application } from "./application";
import {
    analysisColumn,
    manageCredentials,
    sourceDropdown,
    sourceCredential,
    mavenCredential,
    nextButton,
    addRules,
    fileName,
    reportStoryPoints,
} from "../../../views/analysis.view";
import { kebabMenu } from "../../../views/applicationinventory.view";

export class Analysis extends Application {
    name: string;
    source: string;
    target: string[];
    binary?: string;
    scope?: string;
    customRule?: string;
    sources?: string;
    excludeRuleTags?: string;
    enableTransaction?: boolean;
    appName?: string;
    storyPoints?: number;

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
            customRule,
            sources,
            excludeRuleTags,
            enableTransaction,
            appName,
            storyPoints,
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
        uploadApplications(this.binary);
        cy.get("span.pf-c-progress__measure", { timeout: 15000 }).should("contain", "100%");
    }

    protected uploadCustomRule() {
        cy.contains("button", "Add rules", { timeout: 20000 }).should("be.enabled").click();
        uploadXml("xml/" + this.customRule);
        cy.wait(2000);
        cy.get("span.pf-c-progress__measure", { timeout: 15000 }).should("contain", "100%");
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
            if (!this.scope) cy.contains("button", "Next", { timeout: 200 }).click();
            if (this.customRule) this.uploadCustomRule();
            cy.contains("button", "Next", { timeout: 200 }).click();
            if (!this.sources) cy.contains("button", "Next", { timeout: 200 }).click();
            cy.contains("button", "Run", { timeout: 200 }).click();
            checkSuccessAlert(commonView.successAlertMessage, `Submitted for analysis`);
        }
    }

    verifyAnalysisStatus(status) {
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                cy.get(analysisColumn)
                    .find("div > div")
                    .then(($a) => {
                        if ($a.text().toString() != status) {
                            // If analysis failed and is not expected then test fails.
                            if ($a.text().toString() == "Failed" && status != "Failed") {
                                expect($a.text().toString()).to.eq("Completed");
                            }
                            cy.wait(10000);
                            this.verifyAnalysisStatus(status);
                        } else {
                            expect($a.text().toString()).to.eq(status);
                            cy.wait(2000);
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
}
