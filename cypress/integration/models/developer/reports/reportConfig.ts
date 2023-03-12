import {
    clickByText,
    disableSwitch,
    enableSwitch,
    selectUserPerspective,
} from "../../../../utils/utils";
import { downloadCSV, downloadHTML } from "../../../views/reports.view";
import { administration, general } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";

export class ReportConfig {
    private static instance: ReportConfig;
    static downloadHtml: boolean;
    static downloadCsv: boolean;
    static fullUrl = Cypress.env("tackleUrl") + "/general";

    // ReportConfig class is singleton, which means that only one object of this class can be created
    // This function is required to get ReportConfig instance in any part of the code
    public static getInstance(): ReportConfig {
        if (!ReportConfig.instance) {
            ReportConfig.instance = new ReportConfig();
        }
        return ReportConfig.instance;
    }

    static openConfig(): void {
        cy.url().then(($url) => {
            if ($url != ReportConfig.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navMenu, general);
            }
        });
    }

    enableDownloadHtml(): void {
        ReportConfig.openConfig();
        enableSwitch(downloadHTML);
        ReportConfig.downloadHtml = true;
    }

    disableDownloadHtml(): void {
        ReportConfig.openConfig();
        disableSwitch(downloadHTML);
        ReportConfig.downloadHtml = false;
    }

    enableDownloadCsv(): void {
        ReportConfig.openConfig();
        enableSwitch(downloadCSV);
        ReportConfig.downloadCsv = true;
    }

    disableDownloadCsv(): void {
        ReportConfig.openConfig();
        disableSwitch(downloadCSV);
        ReportConfig.downloadCsv = false;
    }
}
