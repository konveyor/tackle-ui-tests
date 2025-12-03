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
import { AssetGeneratorData, GeneratorTemplateRepository } from "cypress/e2e/types/types";
import {
    cancelForm,
    click,
    clickByText,
    inputText,
    performRowActionByIcon,
    selectFormItems,
    selectItemsPerPage,
    selectUserPerspective,
    submitForm,
} from "../../../../utils/utils";
import { administration, itemsPerPage, SEC } from "../../../types/constants";
import {
    DELETE_ICON_SELECTOR,
    GeneratorFieldSelector,
    GENERATORS_MENU,
} from "../../../views/asset-generators.view";
import { confirmButton, pencilAction } from "../../../views/common.view";
import { navMenu } from "../../../views/menu.view";

export class AssetGenerator {
    name: string;
    generatorType: string;
    templateRepository: GeneratorTemplateRepository;
    description?: string;

    constructor(assetGeneratorData: AssetGeneratorData) {
        this.name = assetGeneratorData.name;
        this.generatorType = assetGeneratorData.generatorType;
        this.templateRepository = assetGeneratorData.templateRepository;
        this.description = assetGeneratorData.description;
    }

    static fullUrl = Cypress.config("baseUrl") + "/asset-generators";

    public static open(forceReload = false) {
        if (forceReload) {
            cy.visit(AssetGenerator.fullUrl, { timeout: 15 * SEC }).then((_) => {
                cy.get("h1", { timeout: 35 * SEC }).should("contain", GENERATORS_MENU);
                selectItemsPerPage(itemsPerPage);
            });
            return;
        }

        cy.url().then(($url) => {
            if ($url !== AssetGenerator.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navMenu, GENERATORS_MENU);
                cy.get("h1", { timeout: 60 * SEC }).should("contain", GENERATORS_MENU);
            }
        });
        selectItemsPerPage(itemsPerPage);
    }

    protected fillName(name: string): void {
        inputText(GeneratorFieldSelector.Name, name);
    }

    protected fillDescription(description: string): void {
        inputText(GeneratorFieldSelector.Description, description);
    }

    protected selectGeneratorType(generatorType: string): void {
        selectFormItems(GeneratorFieldSelector.GeneratorType, generatorType);
    }

    protected fillTemplateRepository(templateRepository: GeneratorTemplateRepository): void {
        selectFormItems(GeneratorFieldSelector.RepositoryType, templateRepository.repositoryType);
        inputText(GeneratorFieldSelector.RepositoryUrl, templateRepository.url);

        if (templateRepository.branch) {
            inputText(GeneratorFieldSelector.RepositoryBranch, templateRepository.branch);
        }

        if (templateRepository.rootPath) {
            inputText(GeneratorFieldSelector.RepositoryRootPath, templateRepository.rootPath);
        }
    }

    create(cancel = false): void {
        AssetGenerator.open();
        cy.contains("button", "Create new generator", { timeout: 8000 })
            .should("be.visible")
            .and("not.be.disabled")
            .click();
        if (cancel) {
            cancelForm();
        } else {
            this.fillName(this.name);
            if (this.description) this.fillDescription(this.description);
            if (this.generatorType) this.selectGeneratorType(this.generatorType);
            if (this.templateRepository) this.fillTemplateRepository(this.templateRepository);
            submitForm();
        }
    }

    delete(cancel = false): void {
        AssetGenerator.open();
        performRowActionByIcon(this.name, DELETE_ICON_SELECTOR);
        if (cancel) {
            cancelForm();
        } else click(confirmButton);
    }

    edit(
        updatedValues: Partial<{
            name: string;
            description: string;
            generatorType: string;
            templateRepository: GeneratorTemplateRepository;
        }>,
        cancel = false
    ): void {
        AssetGenerator.open();
        performRowActionByIcon(this.name, pencilAction);

        if (cancel) {
            cancelForm();
            return;
        }

        const { name, description, generatorType, templateRepository } = updatedValues;

        if (name && name !== this.name) {
            this.fillName(name);
            this.name = name;
        }

        if (description && description !== this.description) {
            this.fillDescription(description);
            this.description = description;
        }

        if (generatorType && generatorType !== this.generatorType) {
            this.selectGeneratorType(generatorType);
            this.generatorType = generatorType;
        }

        if (templateRepository) {
            this.fillTemplateRepository(templateRepository);
            this.templateRepository = templateRepository;
        }

        if (Object.keys(updatedValues).length > 0) {
            submitForm();
        }
    }
}
