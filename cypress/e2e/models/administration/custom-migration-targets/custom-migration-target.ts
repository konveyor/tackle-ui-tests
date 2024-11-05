import {
    click,
    clickByText,
    clickJs,
    inputText,
    selectUserPerspective,
    submitForm,
    uploadXml,
} from "../../../../utils/utils";
import {
    createNewButton,
    customMigrationTargets,
    button,
    deleteAction,
    editAction,
    RepositoryType,
    CustomRuleType,
    Languages,
    SEC,
} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import {
    CustomMigrationTargetView,
    sourcesList,
    sourcesToggle,
} from "../../../views/custom-migration-target.view";
import { RulesManualFields, RulesRepositoryFields } from "../../../types/types";
import { submitButton } from "../../../views/common.view";

export interface CustomMigrationTarget {
    name: string;
    description?: string;
    imagePath?: string;
    ruleTypeData: RulesRepositoryFields | RulesManualFields;
    language: Languages;
    sources?: string[];
    targets?: string[];
}

export class CustomMigrationTarget {
    constructor(
        name: string,
        description: string,
        imagePath: string,
        ruleTypeData: RulesRepositoryFields | RulesManualFields,
        language = Languages.Java,
        sources?: string[],
        targets?: string[]
    ) {
        this.name = name;
        this.description = description;
        this.ruleTypeData = ruleTypeData;
        this.language = language;
        this.sources = sources;
    }

    public static fullUrl = Cypress.env("tackleUrl") + "/migration-targets";

    public static open(forceReload = false) {
        if (forceReload) {
            cy.visit(CustomMigrationTarget.fullUrl);
        }

        cy.url().then(($url) => {
            if ($url != CustomMigrationTarget.fullUrl) {
                selectUserPerspective("Administration");
                clickByText(navMenu, customMigrationTargets);
            }
        });
    }

    public static openNewForm() {
        CustomMigrationTarget.open();
        clickByText(button, createNewButton);
    }

    public openLanguageForm() {
        CustomMigrationTarget.open();
        CustomMigrationTarget.selectLanguage(this.language);
        clickByText(button, createNewButton);
    }

    public create() {
        this.openLanguageForm();
        CustomMigrationTarget.fillForm(this);
        submitForm();
        cy.get(submitButton, { timeout: 1 * SEC }).should("not.exist");
    }

    public openEditDialog() {
        CustomMigrationTarget.open();
        this.expandActionsMenu();
        cy.contains(button, editAction).click();
    }

    public edit(updateValues: Partial<CustomMigrationTarget>) {
        this.openEditDialog();
        CustomMigrationTarget.fillForm(updateValues);
        clickJs(submitButton);
    }

    public delete() {
        CustomMigrationTarget.selectLanguage(this.language);
        this.expandActionsMenu();
        cy.contains(button, deleteAction).click();
    }

    public static fillName(name: string) {
        inputText(CustomMigrationTargetView.nameInput, name);
    }

    public static uploadImage(imagePath: string, input = false) {
        cy.get("div[class='pf-v5-c-file-upload__file-details']")
            .next('input[type="file"]', { timeout: 2 * SEC })
            .selectFile(`cypress/fixtures/${imagePath}`, {
                timeout: 120 * SEC,
                force: true,
            });
    }

    private static fillForm(values: Partial<CustomMigrationTarget>) {
        if (values.name) {
            CustomMigrationTarget.fillName(values.name);
        }

        if (values.description) {
            inputText(CustomMigrationTargetView.descriptionInput, values.description);
        }

        if (values.imagePath) {
            CustomMigrationTarget.uploadImage(values.imagePath);
        }

        if (values.ruleTypeData) {
            if (values.ruleTypeData.type === CustomRuleType.Manual) {
                CustomMigrationTarget.fillManualForm(values.ruleTypeData);
            }

            if (values.ruleTypeData.type === CustomRuleType.Repository) {
                click(CustomMigrationTargetView.retrieveFromARepositoryRadio);
                CustomMigrationTarget.fillRepositoryForm(values.ruleTypeData);
            }
        }
    }

    public static selectLanguage(language: Languages) {
        CustomMigrationTarget.open();
        cy.get(CustomMigrationTargetView.languageDropdown, { timeout: 30 * SEC }).click();
        clickByText("button", language);
    }

    public static uploadRules(rulePaths: string[]) {
        rulePaths.forEach((path) => uploadXml(path, CustomMigrationTargetView.ruleInput));
    }

    private static fillManualForm(values: Partial<RulesManualFields>) {
        if (values.rulesetPaths && values.rulesetPaths.length) {
            CustomMigrationTarget.uploadRules(values.rulesetPaths);
        }
    }

    public static fillRepositoryUrl(url: string) {
        inputText(CustomMigrationTargetView.repositoryUrl, url);
    }

    public static selectRepositoryType(repositoryType: RepositoryType) {
        click(CustomMigrationTargetView.repositoryTypeDropdown);
        clickByText(button, repositoryType);
    }

    private static fillRepositoryForm(values: Partial<RulesRepositoryFields>) {
        if (values.repositoryType) {
            CustomMigrationTarget.selectRepositoryType(RepositoryType.git);
        }

        if (values.repositoryUrl) {
            CustomMigrationTarget.fillRepositoryUrl(values.repositoryUrl);
        }

        if (values.branch) {
            inputText(CustomMigrationTargetView.branch, values.branch);
        }

        if (values.rootPath) {
            inputText(CustomMigrationTargetView.rootPath, values.rootPath);
        }

        if (values.credentials) {
            click(CustomMigrationTargetView.credentialsDropdown);
            clickByText(button, values.credentials.name);
        }
    }

    private expandActionsMenu() {
        CustomMigrationTarget.selectLanguage(this.language);
        cy.contains(this.name)
            .parents(CustomMigrationTargetView.card)
            .within(() => {
                cy.get(CustomMigrationTargetView.actionsButton).then(($btn) => {
                    if ($btn.attr("aria-expanded") === "false") {
                        $btn.trigger("click");
                    }
                });
            });
    }

    validateSourceTechnology(sources: string[]): void {
        click(sourcesToggle);
        cy.get(sourcesList).should("contain", sources);
    }
}
