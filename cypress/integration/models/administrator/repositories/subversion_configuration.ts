import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { enableInsecureRepository } from "../../../views/repository.view";

export class SubversionConfiguration {
    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Subversion");
        cy.contains("h1", "Subversion configuration", { timeout: 5000 });
    }

    toggleInsecureSubversionRepositories() {
        click(enableInsecureRepository);
    }
}
