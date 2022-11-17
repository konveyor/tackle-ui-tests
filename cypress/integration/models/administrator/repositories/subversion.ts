import {
    checkInsecureRepository,
    clickByText,
    selectUserPerspective,
    uncheckInsecureRepository,
} from "../../../../utils/utils";

export class SubversionConfiguration {
    /**
     * static method used to navigate to the subversion configuration page
     */
    static open() {
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Subversion");
        cy.contains("h1", "Subversion configuration", { timeout: 5000 });
    }

    /**
     *  this functions used to navigate to the subversion configuration page under the administrator view and enable the insecure repo
     */
    enableInsecureSubversionRepositories() {
        SubversionConfiguration.open();
        checkInsecureRepository();
    }

    /**
     *  this functions used to navigate to the subversion configuration page under the administrator view and disable the insecure repo
     */
    disableInsecureSubversionRepositories() {
        SubversionConfiguration.open();
        uncheckInsecureRepository();
    }
}
