import {
    checkInsecureRepository,
    clickByText,
    selectUserPerspective,
    uncheckSecureRepository,
} from "../../../../utils/utils";
import { InsecureRepositoryToggle } from "../../../views/repository.view";

export class GitConfiguration {
    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Git");
        cy.contains("h1", "Git configuration", { timeout: 5000 });
    }

    enableInsecureGitRepositories() {
        checkInsecureRepository(InsecureRepositoryToggle);
    }

    disableInsecureGitRepositories() {
        uncheckSecureRepository(InsecureRepositoryToggle);
    }
}
