import { MigrationWave } from "../models/migration/migration-waves/migration-wave";

export enum MigrationWaveView {
    submitButton = "#migration-wave-form-submit",
    applicationsSubmitButton = "#wave-form-submit",
    nameInput = "#name",
    startDateInput = "input[aria-label='startDate']",
    endDateInput = "input[aria-label='endDate']",
    stakeHoldersInput = "#stakeholders-toggle-select-multi-typeahead-typeahead",
    stakeHolderGroupsInput = "#stakeholder-groups-toggle-select-multi-typeahead-typeahead",
    actionsButton = "button[aria-label='Actions']",
    yearInput = "input[aria-label='Select year']",
    applicationCountColumn = "td[data-label='Applications']",
    issueManagerSelectToggle = "#issue-manager-select-toggle-select-typeahead",
    instanceSelectToggle = "#tracker-select-toggle-select-typeahead",
    projectSelectToggle = "#project-select-toggle-select-typeahead",
    issueTypeSelectToggle = "#issue-type-select-toggle-select-typeahead",
}

export enum MigrationWavesSpecialColumns {
    Applications = "Applications",
    Stakeholders = "Stakeholders",
}
export const getSpecialMigrationWavesTableSelector = (
    wave: MigrationWave,
    columnSelector: MigrationWavesSpecialColumns
) => {
    return `table[aria-label="${columnSelector} table for migration wave ${wave.name}"]`;
};

export const waveTable = "table[aria-label='Migration waves table']";
