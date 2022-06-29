/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { hasToBeSkipped, login } from "../../../../../../utils/utils";
import { TagType } from "../../../../../models/developer/controls/tagtypes";
import { Tag } from "../../../../../models/developer/controls/tags";
import { name, SEC } from "../../../../../types/constants";
import * as data from "../../../../../../utils/data_utils";

describe("Tags filter validations", { tags: "@tier2" }, function () {
    const tagType = new TagType(data.getRandomWord(5), data.getColor());
    const tag = new Tag(data.getRandomWord(5), tagType.name);

    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();
        tagType.create();
        tag.create();
    });

    it("Tag name filter validations", function () {
        // Navigate to Tags tab
        let validSearchInput = tag.name.substring(0, 3);
        let filterType = name;

        //Applying valid filter
        Tag.applyFilter(filterType, validSearchInput);

        //Clear all filters
        Tag.clearAllFilters();

        // Enter a non-existing tag name substring and apply it as search filter
        let invalidSearchInput = String(data.getRandomNumber(111111, 222222));
        Tag.applyFilter(filterType, invalidSearchInput, false);
    });

    after("Cleanup", function () {
        tag.delete();
        cy.wait(SEC);
        tagType.delete();
    });
});
