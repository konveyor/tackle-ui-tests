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
export const GENERATORS_MENU = "Generators";

export enum GeneratorFieldSelector {
    Name = "input[id='name']",
    Description = "input[id='description']",
    GeneratorType = "input[id='generator-type-toggle-select-typeahead']",
    TemplateRepositoryToggle = "div[id='template-repository-header']",
    RepositoryType = "button[id='repo-type-toggle']",
    RepositoryUrl = "input[id='repository.url']",
    RepositoryBranch = "input[id='branch']",
    RepositoryRootPath = "input[id='path']",
}

export enum GeneratorType {
    Helm = "Helm",
}

export const DELETE_ICON_SELECTOR = "td[id='delete-action']";
