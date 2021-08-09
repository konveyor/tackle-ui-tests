## End-to-end Cypress tests for tackle-ui

### Getting Started ###

#### Requirements
1. Operating system
    
    `Fedora 21 and above (64-bit only)`

2. Install Node.js 12 or 14 and above

```bash
    sudo dnf install nodejs
    OR
    sudo dnf install npm    # also installs nodejs
```

3. Upgrade Node to 12 or 14 or above

    `sudo npm install -g n`

#### Install and run automation

1. Clone automation repository

    `git clone https://github.com/konveyor/tackle-ui-tests.git`

2. Go to folder and install

    `cd tackle-ui-tests`

    `npm install .`

3. Open Cypress and run test cases

    `npx cypress open`

#### Code formatting using Prettier tool

1. Format code

    `npm run format`

2. Check formatting

    `npm run check`

#### Pull request testing

1. Pull requests will be tested against environment before merging to main codebase
2. Pull request's owner must add **RFR** label once pull request is ready to test against environment
3. After adding 'RFR' label; Owner should force push the pull request to trigger GitHub action

#### Test runs
1. Click here to see **Old** test runs - [run1](https://dashboard.cypress.io/projects/cbdv4m/runs), [run2](https://dashboard.cypress.io/projects/dvmnpr/runs)

2. Click [here](https://dashboard.cypress.io/projects/1g7617/runs) to see **Current** test runs
