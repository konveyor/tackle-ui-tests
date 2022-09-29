import {Configuration} from "./configuration";
import {click, clickByText} from "../../../../utils/utils";
import {clearRepository, confirmClear} from "../../../views/maven_configuration.view";


export class MavenConfiguration extends Configuration {

    static open() {
        super.open()
        clickByText("a.pf-c-nav__link", "Maven");
        cy.contains("h1", "Maven configuration", {timeout: 5000});
    }

    protected ConsumeInsecureMavenRepositories() {
        super.enableInsecureRepository();
    }

    protected clearRepository() {
        clickByText(clearRepository, 'Clear repository');
        click(confirmClear);
    }
}