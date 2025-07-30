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
export const applicationsActionButton = "button[aria-label='Application actions']";

export const applicationNameInput = "input[name=name]";
export const applicationDescriptionInput = "input[name=description]";
export const applicationBusinessServiceSelect = "[placeholder='Select a business service']";
export const tagsColumnSelector = "td[data-label='Tags']";

export const applicationContributorsInput =
    "#contributors-select-toggle-select-multi-typeahead-typeahead";
export const applicationContributorsText = ".pf-v5-c-chip__text";
export const applicationContributorsAction = ".pf-v5-c-chip__actions";
export const applicationOwnerInput = "#owner-toggle-select-typeahead";
export const modalBoxDialog = "#confirm-dialog";
export const modalBoxMessage = ".pf-v5-c-modal-box__body";
export const reviewConfirmationText =
    "This application has already been reviewed. Do you want to continue?";
export const repoTypeSelect = "button[id='repo-type-toggle']";
export const applicationTagsSelect = "[placeholder='Select tags']";
export const applicationCommentInput = "textarea[name=comments]";
export const businessColumnSelector = "td[data-label='Business Service']";
export const csvFileName = "Filename";
export const FileName = "File name";
export const closeForm = "button[aria-label='close']";
export const copy = "button[aria-label='Copy']";
export const cyclicDependenciesErrorMsg = "cyclic dependencies are not allowed";
export const northdependenciesDropdownBtn = "button[aria-label='northbound-dependencies-toggle']";
export const southdependenciesDropdownBtn = "button[aria-label='southbound-dependencies-toggle']";
export const date = "Import Time";
export const importStatus = "Status";
export const selectBox = "input[type=checkbox]";
export const tags = "span";
export const user = "User";
export const kebabMenu = "#row-actions";
export const kebabMenuAction = "#action";
export const topKebabMenu = "#toolbar-kebab";
export const kebabMenuItem = "span.pf-v5-c-menu__item-text";
export const bulkApplicationSelectionCheckBox = "input[name='bulk-selected-items-checkbox']";
export const profileEdit = ".pf-m-1-col > .pf-v5-c-button";
export const appContributorSelect = "#contributors-select-toggle-select-multi-typeahead-typeahead";
export const appSelectionButton = "button.pf-v5-c-menu-toggle__button";
// This is on the Application imports page.
export const sideKebabMenu = "button[aria-label='Kebab toggle']";

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
    tagFilter = "#filter-control-source-typeahead-select-input",
    tagCategory = "div[class='pf-v5-c-content'] > h4",
    filterSourceMenu = "span.pf-v5-c-menu__item-text",
    tagCategoryFilter = "#filter-control-tagCategory-typeahead-select-input",
}

// Fields related to copy assessment modal
export const copyAssessmentTableTd = ".pf-m-compact> tbody > tr > td";
export const copyAssessmentTableTr = ".pf-m-compact> tbody > tr";
export const copyAssessmentPagination = "#bulk-copy-assessment-review-pagination-top";
export const copyAssessmentModal = "div.pf-v5-c-modal-box";

// Fields related to application import
export const appImportForm = "form.pf-v5-c-form";
export const ViewArchetypes = "View archetypes";
export const customActionButton = "#custom-action-button";
export const manageColumnsModal = "[id*='pf-modal-part']";
export const labelTagText = ".pf-v5-c-label__text";
