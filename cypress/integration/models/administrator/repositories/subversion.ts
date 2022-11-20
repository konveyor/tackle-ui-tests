import {
    checkInsecureRepository,
    clickByText,
    selectUserPerspective,
    uncheckInsecureRepository,
} from "../../../../utils/utils";

export class SubversionConfiguration {

    static open() {
        // used to navigate to the subversion configuration page
        selectUserPerspective("Administrator");
        clickByText("a.pf-c-nav__link", "Subversion");
        cy.contains("h1", "Subversion configuration", { timeout: 5000 });
    }

    enableInsecureSubversionRepositories() {
        // navigate to the subversion configuration page under the administrator view and enable the insecure repo
        SubversionConfiguration.open();
        checkInsecureRepository();
    }

    disableInsecureSubversionRepositories() {
        // navigate to the subversion configuration page under the administrator view and disable the insecure repo
        SubversionConfiguration.open();
        uncheckInsecureRepository();
    }
}
