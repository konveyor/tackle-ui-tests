import {
    callWithin,
    click,
    clickByText,
    clickWithFocus,
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
    tdTag,
    trTag,
    selectNone,
    manageApplications,
    exportToIssueManagerAction,
} from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { MigrationWaveView } from "../../../views/migration-wave.view";
import { Stakeholdergroups } from "../controls/stakeholdergroups";
import { Stakeholders } from "../controls/stakeholders";
import {
    cancelButton,
    confirmButton,
    itemsSelectInsideDialog,
    modal,
    submitButton,
} from "../../../views/common.view";
import { selectBox } from "../../../views/applicationinventory.view";
import { Application } from "../applicationinventory/application";

export interface MigrationWave {
    name: string;
    startDate: Date;
    endDate: Date;
    stakeHolders?: Stakeholders[];
    stakeHolderGroups?: Stakeholdergroups[];
    applications?: Application[];
}

export class MigrationWave {
    constructor(
        name: string,
        startDate: Date,
        endDate: Date,
        stakeHolders?: Stakeholders[],
        stakeHolderGroups?: Stakeholdergroups[],
        applications?: Application[]
    ) {
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.stakeHolders = stakeHolders;
        this.stakeHolderGroups = stakeHolderGroups;
        this.applications = applications;
    }

    public static fullUrl = Cypress.env("tackleUrl") + "/migration-waves";

    public static open(forceReload = false) {
        if (forceReload) {
            cy.visit(MigrationWave.fullUrl);
        }
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
        clickWithFocus(MigrationWaveView.submitButton);
        this.setApplications();
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

    public exportToIssueManager(
        issueManager: string,
        instance: string,
        project: string,
        issueType: string
    ): void {
        MigrationWave.open();
        this.expandActionsMenu();
        cy.contains(exportToIssueManagerAction).click();
        cy.get(MigrationWaveView.issueManagerSelectToggle).click();
        cy.contains(issueManager).click();

        cy.get(MigrationWaveView.instanceSelectToggle).click();
        cy.contains(instance).click();

        cy.get(MigrationWaveView.projectSelectToggle).click();
        cy.contains(project).click({ timeout: 10 * SEC, force: true });

        cy.get(MigrationWaveView.issueTypeSelectToggle).click();
        cy.contains(issueType).click({ timeout: 10 * SEC, force: true });

        cy.get(submitButton).click();
    }

    public setApplications(toBeCanceled = false): void {
        if (!this.applications || !this.applications.length) {
            return;
        }

        MigrationWave.open();
        this.expandActionsMenu();
        cy.contains(manageApplications).click();
        callWithin(modal, () => selectItemsPerPage(100));
        cy.get(itemsSelectInsideDialog).click();
        cy.contains(button, selectNone).click();
        callWithin(modal, () => selectItemsPerPage(100));

        this.applications.forEach((app) => {
            cy.get(tdTag)
                .contains(app.name)
                .closest(trTag)
                .within((_) => click(selectBox));
        });

        if (toBeCanceled) {
            cy.get(cancelButton).click();
            return;
        }

        cy.get(MigrationWaveView.applicationsSubmitButton).click();
    }

    public clearApplications(): void {
        if (!this.applications || !this.applications.length) {
            expect(
                true,
                `You can't clear the applications of a migration wave with no applications associated.\
               This is not a test-related issue, is a problem in your code`
            ).to.eq(false);
            return;
        }

        cy.contains(manageApplications).click();
        cy.get(itemsSelectInsideDialog).click();
        cy.contains(button, selectNone).click();
        cy.get(MigrationWaveView.applicationsSubmitButton).click();
        this.applications = [];
    }

    public static fillName(name: string): void {
        inputText(MigrationWaveView.nameInput, name);
    }

    /**
     * This method should NOT be used to do assertions, if an invalid date is passed, it'll throw an exception
     * It selects the date using the picker because it can't be manually entered right now due to bug MTA-706
     * @param date
     */
    public fillStartDate(date: Date): void {
        const nowTime = new Date().setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        this.startDate.setHours(0, 0, 0, 0);
        if (nowTime >= date.getTime()) {
            expect(
                true,
                "Start Date should be greater than actual Date. If you want to assert the validation, enter the date manually"
            ).to.eq(false);
        }

        const currentStartDate =
            this.startDate.getTime() !== date.getTime() ? this.startDate : new Date();
        const currentMonth = currentStartDate.toLocaleString("en-us", { month: "long" });
        cy.get(MigrationWaveView.startDateInput)
            .closest(MigrationWaveView.generalDatePicker)
            .find(MigrationWaveView.calendarButton)
            .click();

        MigrationWave.selectDateFromDatePicker(date, currentMonth);
    }

    /**
     * This method should NOT be used to do assertions, if an invalid date is passed, it'll throw an exception
     * It selects the date using the picker because it can't be manually entered right now due to bug MTA-706
     * @param date
     */
    public fillEndDate(date: Date) {
        date.setHours(0, 0, 0, 0);
        this.endDate.setHours(0, 0, 0, 0);
        if (this.startDate.setHours(0, 0, 0, 0) >= date.getTime()) {
            expect(
                true,
                "End Date should be greater than Start Date. If you want to assert the validation, enter the date manually"
            ).to.eq(false);
        }

        const currentEndDate =
            this.endDate.getTime() !== date.getTime() ? this.endDate : new Date();
        const currentMonth = currentEndDate.toLocaleString("en-us", { month: "long" });
        cy.get(MigrationWaveView.endDateInput)
            .closest(MigrationWaveView.generalDatePicker)
            .find(MigrationWaveView.calendarButton)
            .click();
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

    private static fillStakeHolder(stakeHolderName: string) {
        inputText(MigrationWaveView.stakeHoldersInput, stakeHolderName);
        cy.get("button").contains(stakeHolderName).click();
    }

    private static fillStakeHolderGroup(stakeHolderGroupName: string) {
        inputText(MigrationWaveView.stakeHolderGroupsInput, stakeHolderGroupName);
        cy.get("button").contains(stakeHolderGroupName).click();
    }

    static formatDateMMddYYYY(date: Date): string {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
        const year = date.getFullYear();

        return month + "/" + day + "/" + year;
    }

    public expandActionsMenu() {
        if (this.name) {
            const targetName = this.name;
            cy.contains(targetName)
                .parents("tr")
                .within(() => {
                    cy.get(MigrationWaveView.actionsButton).then(($btn) => {
                        if ($btn.attr("aria-expanded") === "false") {
                            $btn.trigger("click");
                        }
                    });
                });
        } else {
            const targetStartDate = MigrationWave.formatDateMMddYYYY(this.startDate);
            const targetEndDate = MigrationWave.formatDateMMddYYYY(this.endDate);

            cy.get("tbody tr").each(($row) => {
                const startCell = $row.find('td[data-label="Start date"]').text().trim();
                const endCell = $row.find('td[data-label="End date"]').text().trim();

                if (startCell === targetStartDate && endCell === targetEndDate) {
                    cy.wrap($row)
                        .find(MigrationWaveView.actionsButton)
                        .then(($btn) => {
                            if ($btn.attr("aria-expanded") === "false") {
                                $btn.trigger("click");
                            }
                        });
                }
            });
        }
    }

    private static selectDateFromDatePicker(date: Date, currentMonth: string) {
        cy.get(MigrationWaveView.yearInput).type(`{selectAll}${date.getFullYear()}`);
        cy.contains("button", currentMonth).click();
        cy.contains("li", date.toLocaleString("en-us", { month: "long" })).click();

        // Wait for the date button to be available before clicking
        cy.get(
            'button[aria-label="' +
                date.getDate() +
                " " +
                date.toLocaleString("en-us", { month: "long" }) +
                " " +
                date.getFullYear() +
                '"]'
        )
            .should("be.visible")
            .first()
            .click();
    }

    public clickWaveStatus() {
        cy.contains(this.name)
            .parents("tr")
            .within(() => {
                cy.get(MigrationWaveView.waveStatusColumn).click();
            });
    }

    public isExpanded(): Cypress.Chainable<boolean> {
        return cy
            .contains(this.name)
            .parent()
            .parent()
            .then(($element) => {
                return $element.hasClass(MigrationWaveView.waveExpanded);
            });
    }

    public removeApplications(applications) {
        this.isExpanded().then((expanded) => {
            expect(expanded).to.be.true;
        });

        applications.forEach((application) => {
            cy.contains(application.name)
                .parent()
                .within(() => {
                    cy.get(MigrationWaveView.removeApplicationButton).click();
                });
        });
        this.removeApplicationsFromModel(applications);
    }

    private removeApplicationsFromModel(applicationsList) {
        this.applications = this.applications.filter(
            (application) => !applicationsList.some((app) => app.name === application.name)
        );
    }

    public createTracker() {
        this.isExpanded().then((expanded) => {
            expect(expanded).to.be.true;
        });

        click(MigrationWaveView.createTrackerButton);
    }
    public openManageApplications() {
        MigrationWave.open();
        this.expandActionsMenu();
        cy.contains(manageApplications).click();
    }
}
