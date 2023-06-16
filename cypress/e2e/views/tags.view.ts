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
export const createTagButton = "Create tag";
export const createTagCategoryButton = "Create tag category";
export const colorHelper = "div[id=color-helper]";
export const dropdownMenuToggle = "button[id='tag-type-select-toggle']";
export const nameHelper = "div[id=name-helper]";
export const nameInput = "input[name=name]";
export const rankInput = "input[aria-label='rank']";
export const rankHelper = "div[id=rank-helper]";
export const tagTable = "table[aria-label='tag-table']";
export const tagMenuButton = "button[aria-label='Actions']";
export const tagCategoryHelper = "div[id=tagCategory-helper]";
export const positiveRankMsg = "This field must be greater than 1.";
export const tagCategory = "td[data-label='Tag category']";
export enum tagLabels {
    name = 'td[data-label="Tag name"]',
    type = 'td[data-label="Tag type"]',
    count = 'td[data-label="Tag count"]',
}
