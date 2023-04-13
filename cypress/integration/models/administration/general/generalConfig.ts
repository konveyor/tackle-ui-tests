import {
    clickByText,
    disableSwitch,
    enableSwitch,
    selectUserPerspective,
} from "../../../../utils/utils";
import { downloadCSV, downloadHTML, reviewAssessment } from "../../../views/general.view";
import { administration, general } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";

export class GeneralConfig {
    private static instance: GeneralConfig;
    static downloadHtml: boolean;
    static downloadCsv: boolean;
    static fullUrl = Cypress.env("tackleUrl") + "/general";

    // GeneralConfig class is singleton, which means that only one object of this class can be created
    // This function is required to get GeneralConfig instance in any part of the code
    public static getInstance(): GeneralConfig {
        if (!GeneralConfig.instance) {
            GeneralConfig.instance = new GeneralConfig();
        }
        return GeneralConfig.instance;
    }

    static open(): void {
        cy.url().then(($url) => {
            if ($url != GeneralConfig.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navMenu, general);
            }
        });
    }

    enableDownloadHtml(): void {
        GeneralConfig.open();
        enableSwitch(downloadHTML);
        GeneralConfig.downloadHtml = true;
    }

    disableDownloadHtml(): void {
        GeneralConfig.open();
        disableSwitch(downloadHTML);
        GeneralConfig.downloadHtml = false;
    }

    enableDownloadCsv(): void {
        GeneralConfig.open();
        enableSwitch(downloadCSV);
        GeneralConfig.downloadCsv = true;
    }

    disableDownloadCsv(): void {
        GeneralConfig.open();
        disableSwitch(downloadCSV);
        GeneralConfig.downloadCsv = false;
    }

    enableReviewAssessment(): void {
        GeneralConfig.open();
        enableSwitch(reviewAssessment);
    }

    disableReviewAssessment(): void {
        GeneralConfig.open();
        disableSwitch(reviewAssessment);
    }
}
