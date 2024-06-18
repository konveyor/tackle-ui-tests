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

export const applicationConfidenceandRiskTitle = 'h3:contains("Application confidence and risk")';
export const articleItem = "div.pf-v5-l-stack__item";
export const articleCard = "div.pf-v5-c-card";
export const articleHeader = "div.pf-v5-c-card__header";
export const articleButton = "button.pf-v5-c-button.pf-m-plain";
export const articleBody = "div.pf-v5-c-card__body";
export const articleExpandedContent = "div.pf-v5-c-card__expandable-content";
export const identiFiedRisksTitle = 'h3:contains("Identified risks")';
export const itemsPerPageMenu = "div.pf-m-bottom > div.pf-c-options-menu";
export const itemsPerPageToggleButton = "div > button[aria-label='Items per page']";
export const closeRowIdentifiedRisk =
    ":nth-child(4) > .pf-c-card > .pf-c-card__header > .pf-c-card__header-toggle > .pf-c-button > .pf-c-card__header-toggle-icon > svg";
export const switchToggle = ".pf-v5-c-switch__toggle";

export const highRiskDonut = "#landscape-donut-red";
export const mediumRiskDonut = "#landscape-donut-yellow";
export const lowRiskDonut = "#landscape-donut-green";
export const unknownRiskDonut = "#landscape-donut-unassessed";
export const questionnaireNameColumnDataLabel = "Questionnaire Name";
export const landscapeFilterDropdown = "button[aria-label='select questionnaires dropdown toggle']";

export enum IdentifiedRiskTableHeaders {
    questionnaireName = "Questionnaire name",
    section = "Section",
    question = "Question",
    answer = "Answer",
    risk = "Risk",
    applications = "Applications",
}

export const identifiedRisksFilterValidations: {
    id: string;
    name: string;
    text: string;
    should: string;
    shouldNot: string;
}[] = [
    {
        id: "section",
        name: "Section",
        text: "Application details",
        should: "Application details",
        shouldNot: "Application technologies",
    },
    {
        id: "question",
        name: "Question",
        text: "How is the application supported in production?",
        should: "External support provider with a ticket-driven escalation process; no inhouse support resources",
        shouldNot: "How often is the application deployed to production?",
    },
    {
        id: "answer",
        name: "Answer",
        text: "Multiple legal and licensing requirements",
        should: "Does the application have legal and/or licensing requirements?",
        shouldNot: "Not tracked",
    },
    {
        id: "questionnaireName",
        name: "Questionnaire",
        text: "Cloud Native",
        should: "What is the main technology in your application?",
        shouldNot: "Legacy Pathfinder",
    },
    {
        id: "risk",
        name: "Risk",
        text: "Low",
        should: "Bare metal server",
        shouldNot: "Not tracked",
    },
];
