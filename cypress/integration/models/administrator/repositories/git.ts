import {
    checkInsecureRepository,
    clickByText,
    selectUserPerspective,
    uncheckInsecureRepository,
} from "../../../../utils/utils";

/**
 * static method used to navigate to the git configuration page
 */
export class GitConfiguration {
    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Git");
        cy.contains("h1", "Git configuration", { timeout: 5000 });
    }

    /**
     *  this functions used to navigate to the git configuration page under the administrator view and enable the insecure repo
     */
    enableInsecureGitRepositories() {
        GitConfiguration.open();
        checkInsecureRepository();
    }

    /**
     *  this functions used to navigate to the git configuration page under the administrator view and disable the insecure repo
     */
    disableInsecureGitRepositories() {
        GitConfiguration.open();
        uncheckInsecureRepository();
    }
}
