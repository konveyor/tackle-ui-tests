import {
    click,
    clickByText,
    inputText,
    selectItemsPerPage,
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
    migrationWaves,
} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { MigrationWaveView } from "../../../views/migration-wave.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";
import { confirmButton } from "../../../views/common.view";

export interface MigrationWave {
    name: string;
    startDate: Date;
    endDate: Date;
    stakeHolders?: Stakeholders[];
    stakeHolderGroups?: Stakeholdergroups[];
}

export class MigrationWave {
    constructor(
        name: string,
        startDate: Date,
        endDate: Date,
        stakeHolders?: Stakeholders[],
        stakeHolderGroups?: Stakeholdergroups[]
    ) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.stakeHolders = stakeHolders;
        this.stakeHolderGroups = stakeHolderGroups;
    }

    public static fullUrl = Cypress.env("tackleUrl") + "/migration-waves";

    public static open() {
        cy.url().then(($url) => {
            if ($url != MigrationWave.fullUrl) {
                selectUserPerspective("Migration");
                clickByText(navMenu, migrationWaves);
                selectItemsPerPage(100);
            }
        });
    }

    public static openNewForm() {
        MigrationWave.open();
        clickByText(button, createNewButton);
    }

    public create() {
        MigrationWave.openNewForm();
        MigrationWave.fillForm(this);

        cy.get(MigrationWaveView.submitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click();
    }

    public edit(updateValues: Partial<MigrationWave>) {
        MigrationWave.open();
        this.expandActionsMenu();
        cy.contains(editAction).click();

        MigrationWave.fillForm(updateValues);

        cy.get(MigrationWaveView.submitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click({ force: true });
    }

    public delete() {
        MigrationWave.open();
        this.expandActionsMenu();
        cy.contains(deleteAction).click();
        click(confirmButton);
    }

    public static fillName(name: string) {
        inputText(MigrationWaveView.nameInput, name);
    }

    private static fillStakeHolder(stakeHolderName: string) {
        inputText(MigrationWaveView.stakeHoldersInput, stakeHolderName);
        cy.get("button").contains(stakeHolderName).click();
    }

    private static fillStakeHolderGroup(stakeHolderGroupName: string) {
        inputText(MigrationWaveView.stakeHolderGroupsInput, stakeHolderGroupName);
        cy.get("button").contains(stakeHolderGroupName).click();
    }

    private static fillForm(values: Partial<MigrationWave>) {
        if (values.name) {
            MigrationWave.fillName(values.name);
        }

        /*if (values.startDate) {
      inputText(MigrationWaveView.startDateInput, values.startDate.toLocaleDateString());
    }

    if (values.endDate) {
      inputText(MigrationWaveView.endDateInput, values.endDate.toLocaleDateString());
    }*/

        if (values.stakeHolders) {
            values.stakeHolders.forEach((stakeHolder) =>
                MigrationWave.fillStakeHolder(stakeHolder.name)
            );
        }

        if (values.stakeHolderGroups) {
            values.stakeHolderGroups.forEach((stakeHolderGroups) =>
                MigrationWave.fillStakeHolderGroup(stakeHolderGroups.name)
            );
        }
        /*
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
        */
    }

    private expandActionsMenu() {
        cy.contains(this.name)
            .parents("tr")
            .within(() => {
                cy.get(MigrationWaveView.actionsButton).then(($btn) => {
                    if ($btn.attr("aria-expanded") === "false") {
                        $btn.trigger("click");
                    }
                });
            });
    }
}
