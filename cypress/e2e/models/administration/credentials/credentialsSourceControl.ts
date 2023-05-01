import { Credentials } from "./credentials";

export class CredentialsSourceControl extends Credentials {
    type = "Source Control";

    constructor() {
        super();
    }

    create() {
        super.create();
        this.fillName();
        this.fillDescription();
        this.selectType(this.type);
    }
}
