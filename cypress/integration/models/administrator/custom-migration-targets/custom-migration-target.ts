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

export enum CustomMigrationTargetOriginType {
    Repository = "Repository",
    Manual = "Manual",
}

export type CMTRepositoryOrigin = {
    type: CustomMigrationTargetOriginType.Repository;
    repositoryType: RepositoryType;
    repositoryUrl: string;
    branch?: string;
    rootPath?: string;
    credentials?: CredentialsSourceControl;
};

export type CMTManualOrigin = {
    type: CustomMigrationTargetOriginType.Manual;
    imagePath?: string;
    rulesetPath: string;
};

export interface CustomMigrationTarget {
    name: string;
    description?: string;
    rulesOrigin: CMTRepositoryOrigin | CMTManualOrigin;
}

export class CustomMigrationTarget {
    constructor(
        name: string,
        description: string,
        imagePath: string,
        rulesOrigin: CMTRepositoryOrigin | CMTManualOrigin
    ) {
        this.name = name;
        this.description = description;
        this.rulesOrigin = rulesOrigin;
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

        if (values.rulesOrigin) {
            if (values.rulesOrigin.type === CustomMigrationTargetOriginType.Manual) {
                this.fillManualOriginForm(values.rulesOrigin);
            }

            if (values.rulesOrigin.type === CustomMigrationTargetOriginType.Repository) {
                click(CustomMigrationTargetView.retrieveFromARepositoryRadio);
                this.fillRepositoryOriginForm(values.rulesOrigin);
            }
        }
    }

    private fillManualOriginForm(values: Partial<CMTManualOrigin>) {
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

    private fillRepositoryOriginForm(values: Partial<CMTRepositoryOrigin>) {
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
