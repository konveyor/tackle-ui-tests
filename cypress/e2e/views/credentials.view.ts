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
export const credentialNameInput = "input[name=name]";
export const descriptionInput = "input[name='description']";
export const usernameInput = "#user";
export const passwordInput = "#password";
export const keyInput = "#key";
export const privatePassphraseInput = "input[aria-label='Private Key Passphrase']";
export const createBtn = "#create-credential-button";
export const selectType = "#type-select-toggle";
export const filteredBy = "#filtered-by";
export const filterCategory = "#filter-category-name";
export const filterCatType = "#filter-category-type";
export const filterCatCreatedBy = "#filter-category-createdBy";
export const filterSelectType = "#select-filter-value-select";
export const searchButton = "#search-button";
export const modalBoxBody = "#confirm-dialog";
export enum credLabels {
    name = 'td[data-label="Name"]',
    description = 'td[data-label="Description"]',
    type = 'td[data-label="Type"]',
    createdBy = 'td[data-label="Created by"]',
}
