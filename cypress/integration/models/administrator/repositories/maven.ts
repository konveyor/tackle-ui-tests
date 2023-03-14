import {
    click,
    clickByText,
    disableSwitch,
    enableSwitch,
    selectUserPerspective,
} from "../../../../utils/utils";
import { clearRepository, confirmClear, mavenSecure } from "../../../views/repository.view";
import { administration } from "../../../types/constants";

export class MavenConfiguration {
    static open() {
        selectUserPerspective(administration);
        clickByText("a.pf-c-nav__link", "Maven");
        cy.contains("h1", "Maven configuration", { timeout: 5000 });
    }

    enableInsecureMavenRepositories() {
        MavenConfiguration.open();
        enableSwitch(mavenSecure);
    }

    disableInsecureMavenRepositories() {
        MavenConfiguration.open();
        disableSwitch(mavenSecure);
    }

    clearRepository() {
        MavenConfiguration.open();
        cy.wait(2000);

        cy.get(clearRepository)
            .invoke("attr", "aria-disabled")
            .then((disabled) => {
                cy.log(disabled);
                if (disabled == "false") {
                    clickByText(clearRepository, "Clear repository");
                    cy.get(".pf-c-modal-box__title-text").contains("Clear repository");
                    click(confirmClear);
                }
            });
    }
}
