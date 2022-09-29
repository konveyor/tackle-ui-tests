import {click, selectUserPerspective} from "../../../../utils/utils";
import {enableInsecureRepository} from "../../../views/configuration.view";


export class Configuration {

    static open() {
        selectUserPerspective("Administrator");
    }

    protected enableInsecureRepository() {
        click(enableInsecureRepository);
    }
}