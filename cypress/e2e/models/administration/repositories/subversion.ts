import {
    clickByText,
    disableSwitch,
    enableSwitch,
    selectUserPerspective,
} from "../../../../utils/utils";
import { administration, SEC } from "../../../types/constants";
import { navLink } from "../../../views/common.view";
import { subversionSecure } from "../../../views/repository.view";

export class SubversionConfiguration {
    static open() {
        selectUserPerspective(administration);
        clickByText(navLink, "Subversion");
        cy.contains("h1", "Subversion configuration", { timeout: 5 * SEC });
        cy.wait(2 * SEC);
    }

    enableInsecureSubversionRepositories() {
        SubversionConfiguration.open();
        enableSwitch(subversionSecure);
    }

    disableInsecureSubversionRepositories() {
        SubversionConfiguration.open();
        disableSwitch(subversionSecure);
    }
}
