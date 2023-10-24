import {
    click,
    clickByText,
    selectUserPerspective,
} from "../../../../utils/utils";
import { SEC, administration, general } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { switchToggle } from "../../../views/reports.view";



export class GeneralConfig {
    private static instance: GeneralConfig;
    static downloadReport: boolean;
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

    public static enableDownloadReport() {
        GeneralConfig.open();
        cy.get(switchToggle, { timeout: 2 * SEC }).then(($checkbox) => {
            if (!$checkbox.prop("checked")) {
                click(switchToggle);
            }
        });
    }

    public static disableDownloadReport() {
        GeneralConfig.open();
        cy.get(switchToggle, { timeout: 2 * SEC }).then(($checkbox) => {
            if ($checkbox.prop("checked")) {
                click(switchToggle);
            }
        });
    }

}
