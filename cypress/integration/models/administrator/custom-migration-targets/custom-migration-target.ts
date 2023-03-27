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
} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";
import { CredentialsSourceControl } from "../../../models/administrator/credentials/credentialsSourceControl";

export enum CustomRuleType {
    Repository = "Repository",
    Manual = "Manual",
}

export type RulesRepositoryFields = {
    type: CustomRuleType.Repository;
    repositoryType: RepositoryType;
    repositoryUrl: string;
    branch?: string;
    rootPath?: string;
    credentials?: CredentialsSourceControl;
};

export type RulesManualFields = {
    type: CustomRuleType.Manual;
    imagePath?: string;
    rulesetPath: string;
};

export interface CustomMigrationTarget {
    name: string;
    description?: string;
    ruleType: RulesRepositoryFields | RulesManualFields;
}

export class CustomMigrationTarget {
    constructor(
        name: string,
        description: string,
        imagePath: string,
        rulesOrigin: RulesRepositoryFields | RulesManualFields
    ) {
        this.name = name;
        this.description = description;
        this.ruleType = rulesOrigin;
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

    public create() {
        CustomMigrationTarget.open();
        clickByText(button, createNewButton);

        this.fillForm(this);

        cy.get(CustomMigrationTargetView.createSubmitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click();
    }

    public edit(updateValues: Partial<CustomMigrationTarget>) {
        CustomMigrationTarget.open();
        this.expandActionsMenu();
        cy.contains("a", editAction).click();

        this.fillForm(updateValues);

        cy.get(CustomMigrationTargetView.editSubmitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click({ force: true });
    }

    public delete() {
        CustomMigrationTarget.open();
        this.expandActionsMenu();
        cy.contains("a", deleteAction).click();
    }

    private fillForm(values: Partial<CustomMigrationTarget>) {
        if (values.name) {
            inputText(CustomMigrationTargetView.nameInput, values.name);
        }

        if (values.description) {
            inputText(CustomMigrationTargetView.descriptionInput, values.description);
        }

        if (values.ruleType) {
            if (values.ruleType.type === CustomRuleType.Manual) {
                this.fillManualForm(values.ruleType);
            }

            if (values.ruleType.type === CustomRuleType.Repository) {
                click(CustomMigrationTargetView.retrieveFromARepositoryRadio);
                this.fillRepositoryForm(values.ruleType);
            }
        }
    }

    private fillManualForm(values: Partial<RulesManualFields>) {
        if (values.imagePath) {
            cy.get(CustomMigrationTargetView.imageInput).attachFile(
                { filePath: values.imagePath },
                { subjectType: "drag-n-drop" }
            );
        }

        if (values.rulesetPath) {
            uploadXml(values.rulesetPath, CustomMigrationTargetView.ruleInput);
        }
    }

    private fillRepositoryForm(values: Partial<RulesRepositoryFields>) {
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
