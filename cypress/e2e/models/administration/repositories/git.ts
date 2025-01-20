import {
    clickByText,
    disableSwitch,
    enableSwitch,
    selectUserPerspective,
} from "../../../../utils/utils";
import { administration } from "../../../types/constants";
import { navLink } from "../../../views/proxy.view";
import { gitSecure } from "../../../views/repository.view";

export class GitConfiguration {
    static open() {
        // used to navigate to the git configuration page
        selectUserPerspective(administration);
        clickByText(navLink, "Git");
        cy.contains("h1", "Git configuration", { timeout: 5000 });
    }

    enableInsecureGitRepositories() {
        // navigate to the git configuration page under the administrator view and enable the insecure repo
        GitConfiguration.open();
        enableSwitch(gitSecure);
    }

    disableInsecureGitRepositories() {
        // navigate to the git configuration page under the administrator view and disable the insecure repo
        GitConfiguration.open();
        disableSwitch(gitSecure);
    }
}
