import {
    click,
    clickByText,
    inputText,
    selectUserPerspective,
    uploadXml,
} from "../../../../utils/utils";
import {
    createNewButton,
    customMigrationTargets,
    button,
    SEC,
    deleteAction,
    editAction,
    RepositoryType,
    CustomRuleType,
} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { RulesManualFields, RulesRepositoryFields } from "../../../types/types";

export interface CustomMigrationTarget {
    name: string;
    description?: string;
    imagePath?: string;
    ruleTypeData: RulesRepositoryFields | RulesManualFields;
}

export class CustomMigrationTarget {
    constructor(
        name: string,
        description: string,
        imagePath: string,
        ruleTypeData: RulesRepositoryFields | RulesManualFields
    ) {
        this.name = name;
        this.description = description;
        this.ruleTypeData = ruleTypeData;
    }

    public static fullUrl = Cypress.env("tackleUrl") + "/migration-targets";

    public static open() {
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

    public create() {
        CustomMigrationTarget.openNewForm();
        CustomMigrationTarget.fillForm(this);

        cy.get(CustomMigrationTargetView.createSubmitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click();
    }

    public edit(updateValues: Partial<CustomMigrationTarget>) {
        CustomMigrationTarget.open();
        this.expandActionsMenu();
        cy.contains("a", editAction).click();

        CustomMigrationTarget.fillForm(updateValues);

        cy.get(CustomMigrationTargetView.editSubmitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click({ force: true });
    }

    public delete() {
        CustomMigrationTarget.open();
        this.expandActionsMenu();
        cy.contains("a", deleteAction).click();
    }

    public static fillName(name: string) {
        inputText(CustomMigrationTargetView.nameInput, name);
    }

    public static uploadImage(imagePath: string, input = false) {
        cy.get(CustomMigrationTargetView.imageInput).attachFile(
            { filePath: imagePath },
            { subjectType: input ? "input" : "drag-n-drop" }
        );
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

    public static uploadRules(rulePaths: string[]) {
        rulePaths.forEach((path) => uploadXml(path, CustomMigrationTargetView.ruleInput));
    }

    private static fillManualForm(values: Partial<RulesManualFields>) {
        if (values.rulesetPaths && values.rulesetPaths.length) {
            CustomMigrationTarget.uploadRules(values.rulesetPaths);
        }
    }

    private static fillRepositoryForm(values: Partial<RulesRepositoryFields>) {
        if (values.repositoryType) {
            click(CustomMigrationTargetView.repositoryTypeDropdown);
            clickByText(button, RepositoryType.git);
        }

        if (values.repositoryUrl) {
            inputText(CustomMigrationTargetView.repositoryUrl, values.repositoryUrl);
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
        cy.contains(this.name)
            .parents("article")
            .within(() => {
                cy.get(CustomMigrationTargetView.actionsButton).then(($btn) => {
                    if ($btn.attr("aria-expanded") === "false") {
                        $btn.trigger("click");
                    }
                });
            });
    }
}
