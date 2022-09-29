import { Configuration } from "./configuration";
import { clickByText } from "../../../../utils/utils";

export class GitConfiguration extends Configuration {
    static open() {
        super.open();
        clickByText("a.pf-c-nav__link", "Git");
        cy.contains("h1", "Git configuration", { timeout: 5000 });
    }

    enableInsecureGitRepositories() {
        super.enableInsecureRepository();
    }

    disableInsecureGitRepositories() {
        super.enableInsecureRepository();
    }
}
