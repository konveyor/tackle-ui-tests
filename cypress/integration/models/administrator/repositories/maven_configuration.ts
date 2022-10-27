import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import {
    clearRepository,
    confirmClear,
    enableInsecureRepository,
} from "../../../views/repository.view";

export class MavenConfiguration {
    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Maven");
        cy.contains("h1", "Maven configuration", { timeout: 5000 });
    }

    protected toggleInsecureMavenRepositories() {
        click(enableInsecureRepository);
    }

    protected clearRepository() {
        clickByText(clearRepository, "Clear repository");
        click(confirmClear);
    }
}
