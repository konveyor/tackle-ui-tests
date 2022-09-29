import { Configuration } from "./configuration";
import { clickByText } from "../../../../utils/utils";

export class SubversionConfiguration extends Configuration {
    static open() {
        super.open();
        clickByText("a.pf-c-nav__link", "Subversion");
        cy.contains("h1", "Subversion configuration", { timeout: 5000 });
    }

    enableInsecureSubversionRepositories() {
        super.enableInsecureRepository();
    }

    disableInsecureSubversionRepositories() {
        super.enableInsecureRepository();
    }
}
