import {
    clickByText,
    disableSwitch,
    enableSwitch,
    selectUserPerspective,
} from "../../../../utils/utils";
import { administration } from "../../../types/constants";
import { subversionSecure } from "../../../views/repository.view";
import { navLink } from "../../../views/common.view";

export class SubversionConfiguration {
    static open() {
        // used to navigate to the subversion configuration page
        selectUserPerspective(administration);
        clickByText(navLink, "Subversion");
        cy.contains("h1", "Subversion configuration", { timeout: 5000 });
    }

    enableInsecureSubversionRepositories() {
        // navigate to the subversion configuration page under the administrator view and enable the insecure repo
        SubversionConfiguration.open();
        enableSwitch(subversionSecure);
    }

    disableInsecureSubversionRepositories() {
        // navigate to the subversion configuration page under the administrator view and disable the insecure repo
        SubversionConfiguration.open();
        disableSwitch(subversionSecure);
    }
}
