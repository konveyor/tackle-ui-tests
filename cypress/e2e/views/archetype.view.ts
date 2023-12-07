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
export const name = "#name";
export const description = "#description";
export const criteriaTags = "#criteria";
export const archetypeTags = "#tags";
export const stakeholders = "input[aria-label='stakeholder-select-toggle']";
export const stakeholderGroups = "input[aria-label='stakeholder-groups-select-toggle']";
export const comments = "#comments";

//Fields related to archetype side drawer
export enum sideDrawer {
    risk = "h3.pf-v5-c-title.pf-m-md",
    riskValue = "span.pf-v5-c-label__content",
    closeDrawer = "button[aria-label='Close drawer panel']",
}
