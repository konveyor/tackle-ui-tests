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
export const actionButton = "button[aria-label='kebab dropdown toggle']";
export const applicationNameInput = "input[name=name]";
export const applicationDescriptionInput = "input[name=description]";
export const applicationBusinessServiceSelect = "[placeholder='Select a business service']";
export const applicationContributorsInput =
    "#contributors-select-toggle-select-multi-typeahead-typeahead";
export const applicationContributorsText = ".pf-v5-c-chip__text";
export const applicationContributorsAction = ".pf-v5-c-chip__actions";
export const applicationOwnerInput = "#owner-toggle-select-typeahead";
export const repoTypeSelect = "button[id='repo-type-toggle']";
export const applicationTagsSelect = "[placeholder='Select tags']";
export const applicationCommentInput = "textarea[name=comments]";
export const businessColumnSelector = "td[data-label='Business service']";
export const csvFileName = "File name";
export const FileName = "File Name";
export const closeForm = "button[aria-label='close']";
export const copy = "button[aria-label='Copy']";
export const cyclicDependenciesErrorMsg = "cyclic dependencies are not allowed";
export const northdependenciesDropdownBtn = "button[aria-label='northbound-dependencies-toggle']";
export const southdependenciesDropdownBtn = "button[aria-label='southbound-dependencies-toggle']";
export const date = "Date";
export const editButton =
    "td[class='pf-v5-c-table__td pf-v5-c-table__inline-edit-action'] > button";
export const importStatus = "Status";
export const northboundHelper = "div[id=northbound-dependencies-helper]";
export const southboundHelper = "div[id=southbound-dependencies-helper]";
export const selectBox = "input[type=checkbox]";
export const tags = "span";
export const user = "User";
export const kebabMenu = "td[class='pf-v5-c-table__td pf-v5-c-table__action'] > button";
export const topKebabMenu = "div > button[aria-label='Actions']";
export const kebabMenuItem = "a.pf-v5-c-dropdown__menu-item";

//Fields related to analysis - source mode
export const sourceRepository = "input[name=sourceRepository]";
export const branch = "input[name=branch]";
export const rootPath = "input[name=rootPath]";

//Fields related to analysis - binary mode
export const group = "input[name=group]";
export const artifact = "input[name=artifact]";
export const version = "input[name=version]";
export const packaging = "input[name=packaging]";

//Fields related to application imports
export const createEntitiesCheckbox = "#create-entities-checkbox";

//Fields related to application details page
export enum appDetailsView {
    applicationTag = "span.pf-v5-c-label__content",
    closeDetailsPage = "button[aria-label='Close drawer panel']",
    tagFilter = "#source-filter-value-select",
    tagCategory = "div[class='pf-v5-c-content'] > h4",
    filterSourceMenu = "div.pf-v5-c-select__menu",
    tagCategoryFilter = "#tagCategory-filter-value-select",
}

// Fields related to copy assessment modal
export const copyAssessmentTableTd = ".pf-m-compact> tbody > tr > td";
export const copyAssessmentTableTr = ".pf-m-compact> tbody > tr";
export const copyAssessmentPagination = "#bulk-copy-assessment-review-pagination-top";
export const copyAssessmentModal = "div.pf-v5-c-modal-box";

// Fields related to application import
export const appImportForm = "form.pf-v5-c-form";
