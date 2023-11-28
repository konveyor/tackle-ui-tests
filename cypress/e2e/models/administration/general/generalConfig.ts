import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { SEC, administration, general } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { switchToggle } from "../../../views/reports.view";

export class GeneralConfig {
    static fullUrl = Cypress.env("tackleUrl") + "/general";

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
