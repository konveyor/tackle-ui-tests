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
    tdTag,
    trTag,
    button,
    createNewButton,
    assessAppButton,
    createAppButton,
    SEC,
    analyzeButton,
    reviewAppButton,
    migration,
    details,
    legacyPathfinder,
} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import {
    applicationNameInput,
    applicationDescriptionInput,
    applicationBusinessServiceSelect,
    applicationTagsSelect,
    applicationCommentInput,
    applicationOwnerInput,
    editButton,
    selectBox,
    sourceRepository,
    branch,
    rootPath,
    group,
    artifact,
    version,
    packaging,
    kebabMenu,
    repoTypeSelect,
    profileEdit,
    appContributorSelect,
    actionButton,
    copyAssessmentModal,
    copy,
    northdependenciesDropdownBtn,
    southdependenciesDropdownBtn,
    closeForm,
} from "../../../views/applicationinventory.view";
import { appDetailsView } from "../../../views/applicationinventory.view";
import * as commonView from "../../../views/common.view";
import {
    clickByText,
    inputText,
    click,
    submitForm,
    cancelForm,
    selectFormItems,
    performRowActionByIcon,
    selectUserPerspective,
    selectItemsPerPage,
    doesExistSelector,
    doesExistText,
    clickTab,
    clickItemInKebabMenu,
    doesExistButton,
    clickWithin,
    validateSingleApplicationIssue,
    checkSuccessAlert,
} from "../../../../utils/utils";
import { AppIssue, applicationData, RbacValidationRules } from "../../../types/types";
import { rightSideMenu, sourceDropdown } from "../../../views/analysis.view";
import { MigrationWave } from "../migration-waves/migration-wave";
import { Issues } from "../dynamic-report/issues/issues";
import { Assessment } from "./assessment";
import { continueButton } from "../../../views/assessment.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";

export class Application {
    name: string;
    business?: string;
    description?: string;
    tags?: Array<string>;
    owner?: string;
    comment?: string;
    analysis?: boolean;
    repoType?: string;
    sourceRepo?: string;
    branch?: string;
    rootPath?: string;
    group?: string;
    artifact?: string;
    version?: string;
    packaging?: string;
    contributor?: string;

    static fullUrl = Cypress.env("tackleUrl") + "/applications/";

    constructor(appData: applicationData) {
        this.init(appData);
    }

    protected init(appData: applicationData) {
        const {
            name,
            business,
            description,
            tags,
            owner,
            comment,
            analysis,
            repoType,
            sourceRepo,
            branch,
            rootPath,
            group,
            artifact,
            version,
            packaging,
            contributor,
        } = appData;
        this.name = name;
        if (business) this.business = business;
        if (description) this.description = description;
        if (comment) this.comment = comment;
        if (tags) this.tags = tags;
        if (owner) this.owner = owner;
        if (analysis) this.analysis = analysis;
        if (repoType) this.repoType = repoType;
        if (sourceRepo) this.sourceRepo = sourceRepo;
        if (branch) this.branch = branch;
        if (rootPath) this.rootPath = rootPath;
        if (group) this.group = group;
        if (artifact) this.artifact = artifact;
        if (version) this.version = version;
        if (packaging) this.packaging = packaging;
        if (contributor) this.contributor = contributor;
    }

    public static open(forceReload = false): void {
        if (forceReload) {
            cy.visit(Application.fullUrl, { timeout: 15 * SEC }).then((_) =>
                selectItemsPerPage(100)
            );
            return;
        }

        cy.url().then(($url) => {
            if ($url != Application.fullUrl) {
                selectUserPerspective(migration);
                clickByText(navMenu, applicationInventory);
            }
        });
        selectItemsPerPage(100);
    }

    protected fillName(name: string): void {
        inputText(applicationNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(applicationDescriptionInput, description);
    }

    protected fillComment(comment: string): void {
        inputText(applicationCommentInput, comment);
    }

    protected selectBusinessService(service: string): void {
        selectFormItems(applicationBusinessServiceSelect, service);
    }

    protected selectTags(tags: Array<string>): void {
        tags.forEach(function (tag) {
            selectFormItems(applicationTagsSelect, tag);
        });
    }

    protected selectOwner(owner: string): void {
        selectFormItems(applicationOwnerInput, owner);
    }

    protected selectContributor(contributor: string): void {
        selectFormItems(appContributorSelect, contributor);
    }

    protected selectRepoType(repoType: string): void {
        selectFormItems(repoTypeSelect, repoType);
    }

    protected fillSourceModeFields(): void {
        //Fields relevant to source code analysis
        clickByText(button, "Source code");
        if (this.repoType) this.selectRepoType(this.repoType);
        inputText(sourceRepository, this.sourceRepo);
        if (this.branch) inputText(branch, this.branch);
        if (this.rootPath) inputText(rootPath, this.rootPath);
    }

    protected fillBinaryModeFields(): void {
        //Fields relevant to binary mode analysis
        clickByText(button, "Binary");
        inputText(group, this.group);
        if (this.artifact) inputText(artifact, this.artifact);
        if (this.version) inputText(version, this.version);
        if (this.packaging) inputText(packaging, this.packaging);
    }

    create(cancel = false): void {
        Application.open();
        cy.contains("button", createNewButton, { timeout: 20000 }).should("be.enabled").click();
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            if (this.business) this.selectBusinessService(this.business);
            if (this.description) this.fillDescription(this.description);
            if (this.comment) this.fillComment(this.comment);
            if (this.tags) this.selectTags(this.tags);
            if (this.owner) this.selectOwner(this.owner);
            if (this.sourceRepo) this.fillSourceModeFields();
            if (this.group) this.fillBinaryModeFields();
            submitForm();
        }
    }

    edit(
        updatedValues: {
            name?: string;
            description?: string;
            business?: string;
            tags?: Array<string>;
            owner?: string;
            comment?: string;
            repoType?: string;
            sourceRepo?: string;
            group?: string;
        },
        updateAppInfo = false,
        cancel = false
    ): void {
        cy.wait(2000);
        if (updateAppInfo) {
            this.editApplicationFromApplicationProfile();
        } else {
            performRowActionByIcon(this.name, editButton);
        }

        if (cancel) {
            cancelForm();
        } else {
            if (updatedValues.name && updatedValues.name != this.name) {
                this.fillName(updatedValues.name);
                this.name = updatedValues.name;
            }
            if (updatedValues.description && updatedValues.description != this.description) {
                this.fillDescription(updatedValues.description);
                this.description = updatedValues.description;
            }
            if (updatedValues.business && updatedValues.business != this.business) {
                this.selectBusinessService(updatedValues.business);
                this.business = updatedValues.business;
            }
            if (updatedValues.tags && updatedValues.tags != this.tags) {
                this.selectTags(updatedValues.tags);
                this.tags = updatedValues.tags;
            }
            if (updatedValues.comment && updatedValues.comment != this.comment) {
                this.fillComment(updatedValues.comment);
                this.comment = updatedValues.comment;
            }
            if (updatedValues.repoType && updatedValues.repoType != this.repoType) {
                this.selectRepoType(updatedValues.repoType);
                this.repoType = updatedValues.repoType;
            }
            if (updatedValues.owner && updatedValues.owner != this.owner) {
                this.selectOwner(updatedValues.owner);
                this.owner = updatedValues.owner;
            }
            if (updatedValues.group && updatedValues.group != this.group) {
                this.fillBinaryModeFields();
                this.group = updatedValues.group;
            }
            if (updatedValues.sourceRepo && updatedValues.sourceRepo != this.repoType) {
                this.selectRepoType(updatedValues.sourceRepo);
                this.repoType = updatedValues.sourceRepo;
            }
            if (updatedValues) {
                submitForm();
            }
        }
    }

    removeBusinessService(): void {
        cy.wait(2000);
        performRowActionByIcon(this.name, editButton);
        cy.get(applicationBusinessServiceSelect)
            .closest("div")
            .next("button")
            .then(($a) => {
                if ($a.hasClass(commonView.dropdownClearSelection)) $a.click();
            });
        submitForm();
    }

    delete(cancel = false): void {
        Application.open();
        cy.wait(2000);
        clickItemInKebabMenu(this.name, "Delete");
        if (cancel) {
            cancelForm();
        } else {
            click(commonView.confirmButton);
            cy.wait(2000);
        }
    }

    selectApplication(): void {
        cy.wait(4000);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                click(selectBox);
                cy.wait(2000);
            });
    }

    getColumnText(columnSelector: string, columnText: string): void {
        selectItemsPerPage(100);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                cy.get(columnSelector).should("contain", columnText);
            });
    }

    applicationDetailsTab(tab: string): void {
        // Navigate to the application details page and click desired tab
        this.selectApplicationRow();
        cy.get(rightSideMenu).within(() => {
            clickTab(tab);
        });
    }

    closeApplicationDetails(): void {
        click(appDetailsView.closeDetailsPage);
    }

    selectApplicationRow(): void {
        cy.get(tdTag, { timeout: 10 * SEC })
            .contains(this.name)
            .closest(trTag)
            .click();
    }

    /**
     * Filter tags on application details page
     * @param source string to filter on
     */
    filterTags(source: string): void {
        this.applicationDetailsTab("Tags");
        cy.wait(2000);
        if (source != "Manual" && source != "Analysis")
            cy.get(appDetailsView.tagCategoryFilter).click();
        else cy.get(appDetailsView.tagFilter).click();

        cy.get(appDetailsView.filterSourceMenu).contains(source).click();
    }

    /**
     * Verify that tags and categories are present on Application details -> Tags page
     * @param tags tag or list of tags
     */
    tagAndCategoryExists(tags: string | string[][]): void {
        if (Array.isArray(tags)) {
            // For Tags and Categories
            tags.forEach(function (tag) {
                cy.get(appDetailsView.applicationTag, { timeout: 10 * SEC }).should(
                    "contain",
                    tag[1]
                );
                cy.get(appDetailsView.tagCategory).should("contain", tag[0]);
            });
        }
        // For Tags
        else cy.get(appDetailsView.applicationTag).should("contain", tags);
    }

    noTagExists(): void {
        cy.contains("h2", "No tags available", { timeout: 2 * SEC });
    }

    public validateAssessButton(rbacRules: RbacValidationRules) {
        Application.open();
        performRowActionByIcon(this.name, kebabMenu);
        doesExistButton(assessAppButton, rbacRules["Assess"]);
    }

    public validateReviewButton(rbacRules: RbacValidationRules) {
        Application.open();
        performRowActionByIcon(this.name, kebabMenu);
        doesExistButton(reviewAppButton, rbacRules["Review"]);
    }

    static validateCreateAppButton(rbacRules: RbacValidationRules) {
        Application.open();
        doesExistSelector(createAppButton, rbacRules["Create new"]);
    }

    validateAppContextMenu(rbacRules: RbacValidationRules): void {
        Application.open();
        cy.wait(SEC);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                clickWithin("#row-actions", button);
                doesExistButton(assessAppButton, rbacRules["Application actions"]["Assess"]);
                doesExistButton(reviewAppButton, rbacRules["Application actions"]["Review"]);
                doesExistText(
                    "Discard assessment",
                    rbacRules["Application actions"]["Discard assessment"]
                );
                doesExistText("Discard review", rbacRules["Application actions"]["Discard review"]);
                doesExistText("Delete", rbacRules["Application actions"]["Delete"]);
                doesExistText(
                    "Manage dependencies",
                    rbacRules["Application actions"]["Manage dependencies"]
                );
                doesExistText(
                    "Manage credentials",
                    rbacRules["Application actions"]["Manage credentials"]
                );
                doesExistText(
                    "Analysis details",
                    rbacRules["Application actions"]["Analysis details"]
                );
            });
    }

    validateUploadBinary(rbacRules: RbacValidationRules): void {
        Application.open();
        this.selectApplication();
        cy.contains("button", analyzeButton, { timeout: 20 * SEC })
            .should("be.enabled")
            .click();
        cy.get(sourceDropdown).click();
        doesExistText("Upload a local binary", rbacRules["Upload binary"]);
        clickByText(button, "Cancel");
    }

    validateIssues(appIssues: AppIssue[]): void {
        Issues.openSingleApplication(this.name);
        appIssues.forEach((currentIssue) => {
            validateSingleApplicationIssue(currentIssue);
        });
    }

    editApplicationFromApplicationProfile(): void {
        this.applicationDetailsTab(details);
        cy.wait(2000);
        cy.get(profileEdit).click();
    }

    validateAppInformationExist(appData: applicationData, migrationWave?: MigrationWave): void {
        Application.open();
        cy.wait(5 * SEC);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .click()
            .get(rightSideMenu)
            .within(() => {
                if (appData.owner) {
                    cy.contains(appData.owner, { timeout: 5 * SEC });
                }
                if (appData.contributor) {
                    cy.contains(appData.contributor, { timeout: 5 * SEC });
                }
                if (appData.sourceRepo) {
                    cy.contains(appData.sourceRepo, { timeout: 5 * SEC });
                }
                if (appData.group) {
                    cy.contains(appData.group, { timeout: 5 * SEC });
                }
                if (appData.business) {
                    cy.contains(appData.business, { timeout: 5 * SEC });
                }

                if (appData.comment) {
                    cy.contains(appData.comment, { timeout: 5 * SEC });
                }
                if (migrationWave) {
                    cy.contains(migrationWave.name, { timeout: 5 * SEC });
                }
            });
    }

    clickAssessButton() {
        Application.open();
        clickItemInKebabMenu(this.name, "Assess");
    }

    clickReviewButton() {
        Application.open();
        clickItemInKebabMenu(this.name, "Review");
    }

    perform_assessment(
        risk,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[],
        questionnaireName = legacyPathfinder,
        saveAndReview = false
    ) {
        Application.open();
        clickItemInKebabMenu(this.name, "Assess");
        cy.wait(SEC);
        Assessment.perform_assessment(
            risk,
            stakeholders,
            stakeholderGroups,
            questionnaireName,
            saveAndReview
        );
    }

    perform_review(risk): void {
        Application.open();
        clickItemInKebabMenu(this.name, "Review");
        cy.wait(8 * SEC);
        Assessment.perform_review(risk);
    }

    verifyStatus(column, status): void {
        Application.open();
        Assessment.verifyStatus(this.name, column, status);
    }

    retake_questionnaire(
        risk,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[]
    ): void {
        this.clickAssessButton();
        cy.wait(SEC);
        Assessment.retake_questionnaire(risk, stakeholders, stakeholderGroups);
    }

    validateAssessmentField(risk: string): void {
        Application.open();
        Assessment.validateAssessmentField(this.name, "Application", risk);
    }

    verifyCopyAssessmentDisabled(): void {
        Application.open();
        cy.wait(2 * SEC);
        cy.get(tdTag)
            .contains(this.name)
            .parent(tdTag)
            .parent(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                cy.get("ul > li").find(button).should("not.contain", "Copy assessment");
            });
    }

    copy_assessment(applicationList: Array<Application>, cancel = false): void {
        this.openCopyAssessmentModel();
        this.selectApps(applicationList);
        if (cancel) {
            cancelForm();
        } else {
            click(copy);
            checkSuccessAlert(
                commonView.successAlertMessage,
                `Success! Assessment copied to selected applications`
            );
        }
    }

    copy_assessment_review(applicationList: Array<Application>, cancel = false): void {
        this.openCopyAssessmentModel(true);
        this.selectApps(applicationList);
        if (cancel) {
            cancelForm();
        } else {
            click(copy);
            cy.wait(2 * SEC);
        }
    }

    selectKebabMenuItem(selection: string): void {
        Application.open();
        this.selectApplication();
        clickItemInKebabMenu(this.name, selection);
        cy.get(continueButton).click();
    }

    selectApps(applicationList: Array<Application>): void {
        cy.wait(4 * SEC);
        for (let i = 0; i < applicationList.length; i++) {
            if (applicationList[i].name != this.name) {
                cy.get(".pf-m-compact> tbody > tr > td")
                    .contains(applicationList[i].name)
                    .parent(trTag)
                    .within(() => {
                        click(selectBox);
                        cy.wait(2 * SEC);
                    });
            }
        }
    }

    openCopyAssessmentModel(review = false, items = 100): void {
        let action = "Copy assessment";
        if (review) {
            action += " and review";
        }
        Application.open();
        selectItemsPerPage(items);
        cy.wait(2 * SEC);
        cy.get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .within(() => {
                click(actionButton);
                cy.wait(500);
                clickByText(button, action);
            });
        cy.get(copyAssessmentModal).within(() => {
            selectItemsPerPage(items);
        });
    }

    // Opens the manage dependencies dialog from application inventory page
    openManageDependencies(): void {
        Application.open();
        performRowActionByIcon(this.name, kebabMenu);
        clickByText(button, "Manage dependencies");
    }

    // Selects the application as dependency from dropdown. Arg dropdownNum value 0 selects northbound, whereas value 1 selects southbound
    selectNorthDependency(appNameList: Array<string>): void {
        appNameList.forEach(function (app) {
            cy.get(northdependenciesDropdownBtn).click();
            cy.contains("button", app).click();
        });
    }

    // Selects the application as dependency from dropdown. Arg dropdownNum value 0 selects northbound, whereas value 1 selects southbound
    selectDependency(dropdownLocator: string, appNameList: Array<string>): void {
        appNameList.forEach(function (app) {
            cy.get(dropdownLocator).click();
            cy.contains("button", app).click();
        });
    }

    // Add north or south bound dependency for an application
    addDependencies(northbound?: Array<string>, southbound?: Array<string>): void {
        if (northbound || southbound) {
            this.openManageDependencies();
            if (northbound.length > 0) {
                this.selectDependency(northdependenciesDropdownBtn, northbound);
                cy.wait(SEC);
            }
            if (southbound.length > 0) {
                this.selectDependency(southdependenciesDropdownBtn, southbound);
                cy.wait(SEC);
            }
            cy.wait(2 * SEC);
            click(closeForm);
        }
    }

    removeDep(dependency, dependencyType) {
        cy.get("div")
            .contains(`Add ${dependencyType} dependencies`)
            .parent("div")
            .siblings()
            .find("span")
            .should("contain.text", dependency)
            .parent("div")
            .find("button")
            .trigger("click");
        if (dependencyType === "northbound") cy.get(northdependenciesDropdownBtn).click();
        else cy.get(southdependenciesDropdownBtn).click();
    }

    // Remove north or south bound dependency for an application
    removeDependencies(northbound?: Array<string>, southbound?: Array<string>): void {
        if (northbound || southbound) {
            this.openManageDependencies();
            if (northbound.length > 0) {
                this.removeDep(northbound[0], "northbound");
                cy.wait(SEC);
            }
            if (southbound.length > 0) {
                this.removeDep(southbound[0], "southbound");
                cy.wait(SEC);
            }
            cy.wait(2 * SEC);
            click(closeForm);
        }
    }

    // Verifies if the north or south bound dependencies exist for an application
    verifyDependencies(northboundApps?: Array<string>, southboundApps?: Array<string>): void {
        if (northboundApps || southboundApps) {
            this.openManageDependencies();
            cy.wait(2 * SEC);
            if (northboundApps && northboundApps.length > 0) {
                northboundApps.forEach((app) => {
                    this.dependencyExists("northbound", app);
                });
            }
            if (southboundApps && southboundApps.length > 0) {
                southboundApps.forEach((app) => {
                    this.dependencyExists("southbound", app);
                });
            }
            click(closeForm);
        }
    }

    // Checks if app name is displayed in the dropdown under respective dependency
    protected dependencyExists(dependencyType: string, appName: string): void {
        cy.get("div")
            .contains(`Add ${dependencyType} dependencies`)
            .parent("div")
            .siblings()
            .find("span")
            .should("contain.text", appName);
    }
}
