/// <reference types="cypress" />

import { login } from '../../../../utils/utils';
import {Jobfunctions} from '../../../models/jobfunctions'

describe('Create New Job Function', () => {
    const jobfunctions = new Jobfunctions();

    beforeEach(() => {
        login();
    });

    it('jobfunctions crud', function() {
        jobfunctions.create();
        jobfunctions.edit();
        jobfunctions.delete();
    });


});
