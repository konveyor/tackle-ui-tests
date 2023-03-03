import {
    checkInsecureRepository,
    clickByText,
    selectUserPerspective,
    uncheckInsecureRepository,
} from "../../../../utils/utils";
import { administration } from "../../../types/constants";

export class GitConfiguration {
    static open() {
        // used to navigate to the git configuration page
        selectUserPerspective(administration);
        clickByText("a.pf-c-nav__link", "Git");
        cy.contains("h1", "Git configuration", { timeout: 5000 });
    }

    enableInsecureGitRepositories() {
        // navigate to the git configuration page under the administrator view and enable the insecure repo
        GitConfiguration.open();
        checkInsecureRepository();
    }

    disableInsecureGitRepositories() {
        // navigate to the git configuration page under the administrator view and disable the insecure repo
        GitConfiguration.open();
        uncheckInsecureRepository();
    }
}
