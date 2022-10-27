import { click, clickByText, selectUserPerspective } from "../../../../utils/utils";
import { enableInsecureRepository } from "../../../views/repository.view";

export class GitConfiguration {
    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Git");
        cy.contains("h1", "Git configuration", { timeout: 5000 });
    }

    toggleInsecureGitRepositories() {
        click(enableInsecureRepository);
    }
}
