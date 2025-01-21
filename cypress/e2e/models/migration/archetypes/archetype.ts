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
    clickKebabMenuOptionArchetype,
    confirm,
    inputText,
    performRowActionByIcon,
    selectFormItems,
    selectItemsPerPage,
    selectUserPerspective,
    sidedrawerTab,
    submitForm,
    validatePageTitle,
} from "../../../../utils/utils";
import { legacyPathfinder, migration, review, SEC, tdTag, trTag } from "../../../types/constants";
import { tagsColumnSelector } from "../../../views/applicationinventory.view";
import * as archetype from "../../../views/archetype.view";
import * as commonView from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";
import { Assessment } from "../applicationinventory/assessment";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";

export interface Archetype {
    name: string;
    criteriaTags: string[];
    archetypeTags: string[];
    description?: string;
    stakeholders?: Stakeholders[];
    stakeholderGroups?: Stakeholdergroups[];
    comments?: string;
}

export class Archetype {
    constructor(
        name: string,
        criteriaTags: string[],
        archetypeTags: string[],
        description?: string,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[],
        comments?: string
    ) {
        this.name = name;
        this.criteriaTags = criteriaTags;
        this.archetypeTags = archetypeTags;
        this.description = description;
        this.stakeholders = stakeholders;
        this.stakeholderGroups = stakeholderGroups;
        this.comments = comments;
    }

    static fullUrl = Cypress.env("tackleUrl") + "/archetypes";

    public static open(forceReload = false) {
        const itemsPerPage = 100;
        if (forceReload) {
            cy.visit(Archetype.fullUrl, { timeout: 15 * SEC }).then((_) => {
                // This explicit wait is required in some cases.
                cy.wait(10 * SEC);
                cy.get("h1", { timeout: 35 * SEC }).should("contain", "Archetypes");
                selectItemsPerPage(itemsPerPage);
            });
            return;
        }

        cy.url().then(($url) => {
            if (!$url.includes(Archetype.fullUrl)) {
                selectUserPerspective(migration);
                clickByText(navMenu, "Archetypes");
                cy.get("h1", { timeout: 60 * SEC }).should("contain", "Archetypes");
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected fillName(name: string): void {
        inputText(archetype.name, name);
    }

    protected selectCriteriaTags(tags: string[]): void {
        tags.forEach(function (tag) {
            selectFormItems(archetype.criteriaTagsSelector, tag);
        });
    }

    protected selectArchetypeTags(tags: string[]): void {
        tags.forEach(function (tag) {
            selectFormItems(archetype.archetypeTagsSelector, tag);
        });
    }

    protected fillDescription(description: string): void {
        inputText(archetype.description, description);
    }

    protected selectStakeholders(stakeholders: Stakeholders[]) {
        stakeholders.forEach((stakeholder) => {
            inputText(archetype.stakeholders, stakeholder.name);
            cy.get("button").contains(stakeholder.name).click();
        });
    }

    protected selectStakeholderGroups(stakeholderGroups: Stakeholdergroups[]) {
        stakeholderGroups.forEach((stakeholderGroup) => {
            inputText(archetype.stakeholderGroups, stakeholderGroup.name);
            cy.get("button").contains(stakeholderGroup.name).click();
        });
    }

    protected fillComment(comments: string): void {
        inputText(archetype.comments, comments);
    }

    create(cancel = false): void {
        Archetype.open();
        cy.contains("button", "Create new archetype").should("be.enabled").click();
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            this.selectCriteriaTags(this.criteriaTags);
            this.selectArchetypeTags(this.archetypeTags);
            if (this.description) this.fillDescription(this.description);
            if (this.stakeholders) this.selectStakeholders(this.stakeholders);
            if (this.stakeholderGroups) this.selectStakeholderGroups(this.stakeholderGroups);
            if (this.comments) this.fillComment(this.comments);
        }
        submitForm();
    }

    delete(cancel = false): void {
        Archetype.open();
        clickKebabMenuOptionArchetype(this.name, "Delete");
        if (cancel) {
            cancelForm();
        } else click(commonView.confirmButton);
    }

    edit(
        updatedValues: {
            name?: string;
            criteriaTags?: string[];
            archetypeTags?: string[];
            description?: string;
            stakeholders?: Stakeholders[];
            stakeholderGroups?: Stakeholdergroups[];
            comments?: string;
        },
        cancel = false
    ): void {
        Archetype.open();
        performRowActionByIcon(this.name, commonView.pencilIcon);

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
            if (updatedValues.criteriaTags && updatedValues.criteriaTags != this.criteriaTags) {
                this.selectCriteriaTags(updatedValues.criteriaTags);
                this.criteriaTags = updatedValues.criteriaTags;
            }
            if (updatedValues.archetypeTags && updatedValues.archetypeTags != this.archetypeTags) {
                this.selectArchetypeTags(updatedValues.archetypeTags);
                this.archetypeTags = updatedValues.archetypeTags;
            }
            if (updatedValues.stakeholders && updatedValues.stakeholders != this.stakeholders) {
                this.selectStakeholders(updatedValues.stakeholders);
                this.stakeholders = updatedValues.stakeholders;
            }
            if (
                updatedValues.stakeholderGroups &&
                updatedValues.stakeholderGroups != this.stakeholderGroups
            ) {
                this.selectStakeholderGroups(updatedValues.stakeholderGroups);
                this.stakeholderGroups = updatedValues.stakeholderGroups;
            }
            if (updatedValues.comments && updatedValues.comments != this.comments) {
                this.fillComment(updatedValues.comments);
                this.comments = updatedValues.comments;
            }
            if (updatedValues) {
                submitForm();
            }
        }
    }

    perform_assessment(
        risk,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[],
        questionnaireName = legacyPathfinder,
        saveAndReview = false
    ) {
        Archetype.open();
        clickKebabMenuOptionArchetype(this.name, "Assess");
        cy.wait(SEC);
        Assessment.perform_assessment(
            risk,
            stakeholders,
            stakeholderGroups,
            questionnaireName,
            saveAndReview
        );
    }

    validateAssessmentField(risk: string): void {
        Archetype.open(true);
        cy.get(tdTag, { timeout: 10 * SEC })
            .contains(this.name)
            .click();
        cy.get(commonView.sideDrawer.risk).contains("Archetype risk");
        cy.get(commonView.sideDrawer.labelContent).should("contain", risk);
        click(commonView.sideDrawer.closeDrawer);
    }

    validateReviewDonutChart(): void {
        Archetype.open();
        clickKebabMenuOptionArchetype(this.name, review);
        Assessment.validateReviewDonutChart();
    }

    selectArchetype(): void {
        cy.get(tdTag, { timeout: 10 * SEC })
            .contains(this.name)
            .closest(trTag)
            .click();
    }

    perform_review(risk): void {
        Archetype.open();
        clickKebabMenuOptionArchetype(this.name, "Review");
        cy.wait(8 * SEC);
        Assessment.perform_review(risk);
    }

    validateReviewFields(): void {
        Archetype.open(true);
        Assessment.validateReviewFields(this.name, "Archetype");
    }

    validateNotReviewed(): void {
        Archetype.open(true);
        Assessment.validateNotReviewed(this.name);
    }

    duplicate(
        name?: string,
        criteriaTags?: string[],
        archetypeTags?: string[],
        description?: string,
        stakeholders?: Stakeholders[],
        stakeholderGroups?: Stakeholdergroups[],
        comments?: string,
        cancel = false
    ) {
        clickKebabMenuOptionArchetype(this.name, "Duplicate");

        if (cancel) {
            cancelForm();
            return;
        }

        // if a new parameter is passed then fill it, else just take the old one and assign to the peer parameter in the new duplicated object
        name ? this.fillName(name) : (name = `${this.name} (duplicate)`);
        criteriaTags ? this.selectCriteriaTags(criteriaTags) : (criteriaTags = this.criteriaTags);
        archetypeTags
            ? this.selectArchetypeTags(archetypeTags)
            : (archetypeTags = this.archetypeTags);
        description ? this.fillDescription(description) : (description = this.description);
        stakeholders ? this.selectStakeholders(stakeholders) : (stakeholders = this.stakeholders);
        stakeholderGroups
            ? this.selectStakeholderGroups(stakeholderGroups)
            : (stakeholderGroups = this.stakeholderGroups);
        comments ? this.fillComment(comments) : (comments = this.comments);

        const duplicatedArchetype = new Archetype(
            name,
            criteriaTags,
            archetypeTags,
            description,
            stakeholders,
            stakeholderGroups,
            comments
        );

        submitForm();

        return duplicatedArchetype;
    }

    getAssociatedAppsCount() {
        Archetype.open();
        return cy
            .get(tdTag)
            .contains(this.name)
            .closest(trTag)
            .find('[data-label="Applications"] a')
            .invoke("text")
            .then((text) => {
                const numberMatch = text.match(/\d+/);
                const number = parseInt(numberMatch[0], 10);
                cy.wrap(isNaN(number) ? null : number).as("appCount");
            });
    }

    assertsTagsMatch(tagsType: string, tagsList: string[], openDrawer = true, closeDrawer = true) {
        if (openDrawer) sidedrawerTab(this.name, "Details");

        cy.contains(tagsType)
            .closest("div")
            .within(() => {
                cy.get("li").then(($lis) => {
                    const foundTags = $lis.map((i, li) => Cypress.$(li).text().trim()).get();
                    const sortedFoundTagsList = foundTags.slice().sort();
                    const sortedTagsList = tagsList.slice().sort();
                    expect(sortedFoundTagsList).to.deep.equal(sortedTagsList);
                });
            });

        if (closeDrawer) click(commonView.sideDrawer.closeDrawer);
    }

    discard(option: string) {
        Archetype.open();
        clickKebabMenuOptionArchetype(this.name, option);
        confirm();
    }

    clickAssessButton() {
        Archetype.open();
        clickKebabMenuOptionArchetype(this.name, "Assess");
    }

    deleteAssessments(): void {
        this.clickAssessButton();
        Assessment.deleteAssessments();
    }

    verifyButtonEnabled(button: string): void {
        //validates current page
        validatePageTitle("Assessment Actions").then((titleMatches) => {
            if (!titleMatches) {
                Archetype.open();
                this.clickAssessButton();
            }
            Assessment.verifyButtonEnabled(button);
        });
    }

    validateTagsColumn(tagsNames: string[]): void {
        tagsNames.forEach((tag) => {
            Archetype.verifyColumnValue(this.name, "Tags", tag);
        });
    }

    public static verifyColumnValue(name: string, column: string, value: string): void {
        const columnSelector =
            column === "Tags" ? tagsColumnSelector : archetype.applicationsColumn;
        Archetype.open();
        cy.get(tdTag)
            .contains(name)
            .parent(trTag)
            .within(() => {
                cy.get(columnSelector).contains(value, { timeout: 30 * SEC });
            });
    }

    verifyStatus(column, status): void {
        Archetype.open();
        Assessment.verifyStatus(this.name, column, status);
    }
}
