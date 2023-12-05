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
} from "../../../../utils/utils";
import { legacyPathfinder, migration, SEC } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";
import * as archetype from "../../../views/archetype.view";
import * as commonView from "../../../views/common.view";
import {
    questionBlock,
    radioInput,
    stakeholdergroupsSelect,
    stakeholderSelect,
    continueButton,
    stack,
    assessmentBlock,
} from "../../../views/assessment.view";

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
        } else click(confirmButton);
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

    take_questionnaire(questionnaireName = legacyPathfinder): void {
        cy.contains(questionnaireName).siblings("td").contains("button", "Take").click();
    }

    clickAssessButton() {
        Archetype.open();
        clickKebabMenuOptionArchetype(this.name, "Assess");
    }

    protected clickRadioOption(questionSelector, optionToSelect) {
        cy.wrap(questionSelector)
            .find(stack)
            .children("div")
            .eq(optionToSelect)
            .find(radioInput)
            .check();
    }

    protected selectAnswers(risk: string, saveAndReview = false): void {
        cy.get(assessmentBlock)
            .its("length")
            .then((count) => {
                let lastStep = count - 2;

                for (let i = 0; i <= lastStep; i++) {
                    cy.get(questionBlock).each(($question) => {
                        let totalOptions = $question.find(stack).children("div").length;
                        let optionToSelect: number;
                        if (risk === "low") {
                            optionToSelect = totalOptions - 1;
                            this.clickRadioOption($question, optionToSelect);
                        } else if (risk === "medium") {
                            cy.wrap($question)
                                .children()
                                .find("div.pf-v5-l-split__item")
                                .then(($questionLine) => {
                                    /* These 3 questions generate high risk with mean options,
                                    hence to keep risk to medium, select last options for these set of specific questions */
                                    if (
                                        $questionLine.text() ===
                                            "Does the application have legal and/or licensing requirements?" ||
                                        $questionLine.text() ===
                                            "Does the application require specific hardware?" ||
                                        $questionLine.text() ===
                                            "How is the application clustering managed?"
                                    ) {
                                        optionToSelect = totalOptions - 1;
                                    } else {
                                        optionToSelect = Math.floor(totalOptions / 2);
                                    }
                                    this.clickRadioOption($question, optionToSelect);
                                });
                        } else {
                            optionToSelect = 1;
                            this.clickRadioOption($question, optionToSelect);
                        }
                    });

                    if (saveAndReview && i == lastStep) {
                        clickJs(commonView.saveAndReviewButton);
                    } else {
                        clickJs(commonView.nextButton);
                    }
                }
            });
    }
    perform_assessment(
        risk,
        stakeholders?: Array<string>,
        stakeholderGroups?: Array<string>,
        questionnaireName = legacyPathfinder,
        saveAndReview = false
    ): void {
        if (stakeholders == undefined && stakeholderGroups == undefined) {
            expect(
                false,
                "At least one arg out of stakeholder or stakeholder groups must be provided !"
            ).to.equal(true);
        } else {
                this.clickAssessButton();
                cy.wait(SEC);
                this.take_questionnaire(questionnaireName);
                cy.wait(SEC);
            }
            if (stakeholders) this.selectStakeholders(stakeholders);
            if (stakeholderGroups) this.selectStakeholderGroups(stakeholderGroups);
            clickJs(commonView.nextButton);
            cy.wait(SEC);
            this.selectAnswers(risk, saveAndReview);
    }
}
