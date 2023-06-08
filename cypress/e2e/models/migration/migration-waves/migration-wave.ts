import {
    click,
    clickByText,
    inputText,
    selectItemsPerPage,
    selectUserPerspective,
} from "../../../../utils/utils";
import {
    createNewButton,
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
        this.fillForm(this);

        cy.get(MigrationWaveView.submitButton, { timeout: 10 * SEC })
            .should("be.enabled")
            .click();
    }

    public edit(updateValues: Partial<MigrationWave>) {
        MigrationWave.open();
        this.expandActionsMenu();
        cy.contains(editAction).click();

        this.fillForm(updateValues);

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

    /**
     * This method should NOT be used to do assertions, if an invalid date is passed, it'll throw an exception
     * It selects the date using the picker because it can't be manually entered right now due to bug MTA-706
     * @param date
     */
    public fillStartDate(date: Date) {
        const nowTime = new Date().setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        if (nowTime >= date.getTime()) {
            expect(
                true,
                "Start Date should be greater than actual Date. If you want to assert the validation, enter the date manually"
            ).to.eq(false);
        }

        const currentStartDate = this.startDate ? this.startDate : new Date();
        const currentMonth = currentStartDate.toLocaleString("en-us", { month: "long" });
        cy.get(MigrationWaveView.startDateInput).next("button").click();
        MigrationWave.selectDateFromDatePicker(date, currentMonth);
    }

    /**
     * This method should NOT be used to do assertions, if an invalid date is passed, it'll throw an exception
     * It selects the date using the picker because it can't be manually entered right now due to bug MTA-706
     * @param date
     */
    public fillEndDate(date: Date) {
        date.setHours(0, 0, 0, 0);
        if (this.startDate.setHours(0, 0, 0, 0) >= date.getTime()) {
            expect(
                true,
                "End Date should be greater than Start Date. If you want to assert the validation, enter the date manually"
            ).to.eq(false);
        }

        const currentEndDate = this.endDate ? this.endDate : new Date();
        const currentMonth = currentEndDate.toLocaleString("en-us", { month: "long" });
        cy.get(MigrationWaveView.endDateInput).next("button").click();
        MigrationWave.selectDateFromDatePicker(date, currentMonth);
    }

    private fillForm(values: Partial<MigrationWave>) {
        if (values.name) {
            MigrationWave.fillName(values.name);
        }

        if (values.startDate) {
            this.fillStartDate(values.startDate);
        }

        if (values.endDate) {
            this.fillEndDate(values.endDate);
        }

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

    private static selectDateFromDatePicker(date: Date, currentMonth: string) {
        cy.get(MigrationWaveView.yearInput).type(`{selectAll}${date.getFullYear()}`);
        cy.contains("button", currentMonth).click();
        cy.contains("li", date.toLocaleString("en-us", { month: "long" })).click();
        cy.contains("button:not([disabled])", `${date.getDate()}`).first().click();
    }
}
