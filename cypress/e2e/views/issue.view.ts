export const searchInput = "#search-input";
export const bsFilterName = "#businessService\\.name-filter-value-select";
export const tagFilterName = "#tag\\.id-filter-value-select";
export const archetypeFilterName = "input[class='pf-v5-c-text-input-group__text-input']";
export const searchMenuToggle = 'button[aria-label="Menu toggle"]';
export const singleAppDropList = "#application-select";
export const rightSideBar = "div.pf-v5-c-drawer__panel-main";
export const affectedFilesTable = "table[aria-label='Affected files table']";
export enum singleApplicationColumns {
    issue = 'td[data-label="Issue"]',
    category = 'td[data-label="Category"]',
    source = 'td[data-label="Source"]',
    target = 'td[data-label="Target(s)"]',
    effort = 'td[data-label="Effort"]',
    files = 'td[data-label="Affected files"]',
}

export enum issueColumns {
    issue = 'td[data-label="Issue"]',
    category = 'td[data-label="Category"]',
    source = 'td[data-label="Source"]',
    target = 'td[data-label="Target(s)"]',
    effort = 'td[data-label="Effort"]',
    applications = 'td[data-label="Affected applications"]',
}
