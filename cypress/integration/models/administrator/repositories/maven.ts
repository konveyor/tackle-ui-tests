import {
    checkInsecureRepository,
    click,
    clickByText,
    selectUserPerspective,
    uncheckInsecureRepository,
} from "../../../../utils/utils";
import { clearRepository, confirmClear } from "../../../views/repository.view";

export class MavenConfiguration {
    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Maven");
        cy.contains("h1", "Maven configuration", { timeout: 5000 });
    }

    enableInsecureMavenRepositories() {
        MavenConfiguration.open();
        checkInsecureRepository();
    }

    disableInsecureMavenRepositories() {
        MavenConfiguration.open();
        uncheckInsecureRepository();
    }

    clearRepository() {
        MavenConfiguration.open();
        clickByText(clearRepository, "Clear repository");

        cy.get(".pf-c-modal-box__title-text").contains("Clear repository");

        click(confirmClear);
    }
}
