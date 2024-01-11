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
export const itemsPerPageToggleButton = "#pagination-id-top-toggle";
export const submitButton = "#submit";
export const cancelButton = "#cancel";
export const closeButton = "button[aria-label=Close]";
export const confirmButton = "#confirm-dialog-button";
export const confirmCancelButton = "#confirm-cancel-button";
export const editButton = "button[aria-label=edit]";
export const deleteButton = "button[aria-label=delete]";
export const removeButton = "button[aria-label='Remove']";
export const clearAllButton = "button[aria-label='Clear all']";
export const controlsForm = "form.pf-v5-c-form";
export const itemsPerPageMenu = "div.pf-c-options-menu";
export const itemsPerPageMenuOptions = "ul.pf-v5-c-menu__list";
export const expandRow = "button[aria-label=Details]";
export const successAlertMessage = ".pf-m-success";
export const infoAlertMessage = ".pf-m-info";
export const alertBody = 'div[id*="pf-modal-part"]';
export const alertTitle = "h4[class*='alert__title']";
export const appTable = ".pf-v5-c-table";
export const expandableRow = ".pf-c-expandable-row";
export const helper = "span.pf-v5-c-helper-text__item-text";
export const filterToggleButton = "div.pf-c-dropdown > button.pf-c-dropdown__toggle";
export const filterInput = "input[type='search']";
export const searchButton = "button#search-button";
export const nextPageButton = "button[aria-label='Go to next page']";
export const prevPageButton = "button[aria-label='Go to previous page']";
export const lastPageButton = "button[aria-label='Go to last page']";
export const firstPageButton = "button[aria-label='Go to first page']";
export const pageNumInput = "input[aria-label='Current page']";
export const optionMenu = "div.perspective";
export const modal = "[id^=pf-modal-part-]";
export const navLink = ".pf-v5-c-nav__link";
export const closeSuccessNotification = "button[aria-label^='Close Success alert:']";
export const divHeader = "[id^=pf-random-id-]";
export const divBottom = "#tags-pagination-bottom";
export const selectFilter = "div.pf-m-toggle-group.pf-m-filter-group.pf-m-show";
export const itemsSelectInsideDialog =
    "div[role='dialog'] button[class='pf-v5-c-menu-toggle__button']";
export const helperBusiness = 'span[class*="helper-text__item"]';
export const stakeHolderGroupHelper = "div.pf-v5-c-helper-text";
export const actionMenuItem = "span.pf-v5-c-menu__item-text";
export const kebabMenuItem = "a.pf-c-dropdown__menu-item";
export const commonTable = "table.pf-v5-c-table.pf-m-grid-md";
export const dropdownClearSelection = "pf-v5-c-select__toggle-clear";
export const footer = "footer";
export const manageImportsActionsButton = "button[aria-label='Table toolbar actions kebab toggle']";
export const nextButton = "button[cy-data='next']";
export const saveAndReviewButton = "button[cy-data='save-and-review']";
export const span = "span";
export const div = "div";
export const liTag = "li";
export const searchInput = "#search-input";
/**
 * ul[role=listbox] > li is for the Application Inventory page.
 * span.pf-c-check__label is for the Copy assessment page.
 */
export const standardFilter = "ul[role=listbox] > li, span.pf-v5-c-check__label";
export const specialFilter = "div.pf-v5-c-select__menu > fieldset > label > span";
export const filterDropDownContainer =
    "div.pf-v5-c-toolbar__group.pf-m-toggle-group.pf-m-filter-group.pf-m-show";
export const filterDropDown = "div.pf-v5-c-select";
export const actionSelectToggle = "#action-select-toggle";

// Application/Archetype side drawer
export enum sideDrawer {
    risk = "h3.pf-v5-c-title.pf-m-md",
    labelContent = "span.pf-v5-c-label__content",
    closeDrawer = "button[aria-label='Close drawer panel']",
    pageDrawerContent = "#page-drawer-content",
    associatedArchetypes = "span.pf-v5-c-description-list__text",
}
