import { clickByText, inputText, selectUserPerspective, uploadXml } from "../../../../utils/utils";
import { createNewButton, customMigrationTargets, button, SEC } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { CustomMigrationTargetView } from "../../../views/custom-migration-target.view";

export interface CustomMigrationTarget {
    name: string;
    description?: string;
    imagePath?: string;
    rulesetPath: string;
}

export class CustomMigrationTarget {
    constructor(name: string, description: string, imagePath: string, rulesPath: string) {
        this.name = name;
        this.description = description;
        this.imagePath = imagePath;
        this.rulesetPath = rulesPath;
    }

    public static fullUrl = Cypress.env("tackleUrl") + "/migration-targets";

    public static openMenu() {
        cy.url().then(($url) => {
            if ($url != CustomMigrationTarget.fullUrl) {
                selectUserPerspective("Administration");
                clickByText(navMenu, customMigrationTargets);
            }
        });
    }

    public create() {
        CustomMigrationTarget.openMenu();
        clickByText(button, createNewButton);

        this.fillForm(this);

        cy.get(CustomMigrationTargetView.createSubmitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click();
    }

    public edit(updateValues: Partial<CustomMigrationTarget>) {
        CustomMigrationTarget.openMenu();
        this.expandActionsMenu();
        cy.contains("a", CustomMigrationTargetView.editAction).click();

        this.fillForm(updateValues);

        cy.get(CustomMigrationTargetView.editSubmitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click({ force: true });
    }

    public delete() {
        CustomMigrationTarget.openMenu();
        this.expandActionsMenu();
        cy.contains("a", CustomMigrationTargetView.deleteAction).click();
    }

    private fillForm(values: Partial<CustomMigrationTarget>) {
        if (values.name) {
            inputText(CustomMigrationTargetView.nameInput, values.name);
        }

        if (values.description) {
            inputText(CustomMigrationTargetView.descriptionInput, values.description);
        }

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
