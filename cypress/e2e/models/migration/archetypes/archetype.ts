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
    clickByText,
    cancelForm,
    inputText,
    selectFormItems,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
    click,
    clickKebabMenuOptionArchetype,
    clickJs,
    clickTab,
} from "../../../../utils/utils";
import { legacyPathfinder, migration, SEC, tdTag, trTag } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";
import * as archetype from "../../../views/archetype.view";
import * as commonView from "../../../views/common.view";
import { rightSideMenu } from "../../../views/analysis.view";
import { Assessment } from "../applicationinventory/assessment";

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
        if (forceReload) {
            cy.visit(Archetype.fullUrl);
        }
        cy.url().then(($url) => {
            if (!$url.includes(Archetype.fullUrl)) {
                selectUserPerspective(migration);
                clickByText(navMenu, "Archetypes");
                selectItemsPerPage(100);
            }
        });
    }

    protected fillName(name: string): void {
        inputText(archetype.name, name);
    }

    protected selectCriteriaTags(tags: string[]): void {
        tags.forEach(function (tag) {
            selectFormItems(archetype.criteriaTags, tag);
        });
    }

    protected selectArchetypeTags(tags: string[]): void {
        tags.forEach(function (tag) {
            selectFormItems(archetype.archetypeTags, tag);
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
        }
        if (this.comments) this.fillComment(this.comments);
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
        clickKebabMenuOptionArchetype(this.name, "Edit");

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

    validateAssessmentField(): void {
        Archetype.open(true);
        this.sidedrawerTab("Details");
        cy.get(archetype.sideDrawer.risk).contains("Archetype risk");
        cy.get(archetype.sideDrawer.riskValue).contains(/High|Medium|Low/g);
        click(archetype.sideDrawer.closeDrawer);
    }

    sidedrawerTab(tab: string): void {
        this.selectArchetype();
        cy.get(rightSideMenu).within(() => {
            clickTab(tab);
        });
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
        // let list = ['Proposed action', 'Effort estimate', 'Business criticality', 'Work priority', 'Comments'];
        let actionList = [
            `Archetype - ${this.name}-Rehost`,
            `Archetype - ${this.name}-Replatform`,
            `Archetype - ${this.name}-Refactor`,
            `Archetype - ${this.name}-Retain`,
            `Archetype - ${this.name}-Repurchase`,
            `Archetype - ${this.name}-Retire`,
        ];
        let effortEstimateList = [
            `Archetype - ${this.name}-Small`,
            `Archetype - ${this.name}-Medium`,
            `Archetype - ${this.name}-Large`,
            `Archetype -$ {this.name}-Extra Large`,
        ];
        let criticalityList = [
            `Archetype - ${this.name}-1`,
            `Archetype - ${this.name}-2`,
            `Archetype - ${this.name}-3`,
            `Archetype - ${this.name}-4`,
            `Archetype - ${this.name}-5`,
            `Archetype - ${this.name}-6`,
            `Archetype - ${this.name}-7`,
            `Archetype - ${this.name}-8`,
            `Archetype - ${this.name}-9`,
            `Archetype - ${this.name}-10`,
        ];

        Archetype.open(true);
        Assessment.validateReviewFields(this.name, actionList, effortEstimateList, criticalityList);
    }
}
