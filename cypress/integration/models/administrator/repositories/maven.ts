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

    protected enableInsecureMavenRepositories() {
        checkInsecureRepository();
    }

    protected disableInsecureMavenRepositories() {
        uncheckInsecureRepository();
    }

    protected clearRepository() {
        clickByText(clearRepository, "Clear repository");
        click(confirmClear);
    }
}
