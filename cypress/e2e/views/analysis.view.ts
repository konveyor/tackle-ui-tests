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
export const sourceDropdown = "#analysis-mode-toggle";
export const analysisColumn = "td[data-label='Analysis']";
export const effortColumn = "td[data-label='Effort']";
export const manageCredentials = "Manage credentials";
export const sourceCredential = "#source-credentials-toggle-select-typeahead";
export const mavenCredential = "#maven-settings-toggle-select-typeahead";
export const nextButton = "button[type=submit]";
export const addRules = "div > footer[class='pf-v5-c-modal-box__footer'] > button";
export const fileName = "div[class='fileName']";
export const reportStoryPoints = "div[class='effortPoints total'] > span[class='points']";
export const enableTransactionAnalysis = "input[name=enableTransactionReport]";
export const excludePackagesSwitch = "#excludedPackages";
export const tabsPanel = "ul > li > a";
export const expandAll = "#expandAll";
export const panelBody = "div.panel-body";
export const analyzeManuallyButton = "#select";
export const addButton = "#add-package-to-include";
export const enterPackageName = "#packageToInclude";
export const enterPackageNameToExclude = "#packageToExclude";
export const analysisDetails = /analysis details$/i;
export const analysisDetailsEditor = ".monaco-editor";
export const rightSideMenu = "#page-drawer-content";
export const enableAutomatedTagging = "input[name=autoTaggingEnabled]";
export const kebabTopMenuButton = "#toolbar-kebab";
export const camelToggleButton = "#Camel-toggle";
export const openjdkToggleButton = "#OpenJDK-toggle";
export const dropDownMenu = "ul.pf-v5-c-menu__list";
export const closeWizard = ".pf-v5-c-wizard__close > .pf-v5-c-button";
export const codeEditorControls = "div.pf-v5-c-code-editor__controls";
export const menuToggle = "button.pf-v5-c-menu-toggle";
export const menuList = "div.pf-v5-c-menu";
export const languageSelectionDropdown = "#filter-control-provider-Languages";
export const numberOfRulesColumn = "td[data-label='Number of rules']";
export const logFilter = "span.pf-v5-c-menu-toggle__toggle-icon";
export const logDropDown = "span.pf-v5-c-menu__item-text";

export enum AnalysisLogView {
    mergedLogView = "Merged log view",
    logView = "Log view",
}
