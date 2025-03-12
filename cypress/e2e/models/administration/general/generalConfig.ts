import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { administration, general } from "../../../types/constants";
import { navMenu } from "../../../views/menu.view";
import { switchToggle } from "../../../views/reportsTab.view";

export class GeneralConfig {
    static fullUrl = Cypress.config("baseUrl") + "/general";

    static open(): void {
        cy.url().then(($url) => {
            if ($url != GeneralConfig.fullUrl) {
                selectUserPerspective(administration);
                clickByText(navMenu, general);
            }
        });
    }

    public static enableDownloadReport() {
        cy.intercept("GET", "/hub/settings/download.html.enabled").as("downloadReportEnabled");
        GeneralConfig.open();
        cy.wait("@downloadReportEnabled").then((interception) => {
            if (!interception.response.body) {
                click(switchToggle);
            }
        });
    }

    public static disableDownloadReport() {
        cy.intercept("GET", "/hub/settings/download.html.enabled").as("downloadReportEnabled");
        GeneralConfig.open();
        cy.wait("@downloadReportEnabled").then((interception) => {
            if (interception.response.body) {
                click(switchToggle);
            }
        });
    }
}
