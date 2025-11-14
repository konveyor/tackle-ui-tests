## End-to-end Cypress tests for Konveyor UI
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fkonveyor%2Ftackle-ui-tests.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fkonveyor%2Ftackle-ui-tests?ref=badge_shield)


## Getting Started

### Requirements
1. Operating system (typically Fedora or MacOS)
2. Install Node.js 22 or above (OS native packages, or [nodejs](https://nodejs.org/en/download), or [nvm](https://github.com/nvm-sh/nvm) managed installs are all ok)

### Install and run automation

1. Clone automation repository and setup
   ```sh
   git clone https://github.com/konveyor/tackle-ui-tests.git
   cd tackle-ui-tests
   npm clean-install
   ```

1. Open Cypress and run test cases
   ```sh
   npx cypress open
   ```

## Required Parameters for Tests

Some tests require certain configuration parameters to be correctly defined in the `cypress.config.ts` file.  Below is a list of tests and the parameters they require.

- `export_to_jira_datacenter.test.ts`
    - `jira_stage_datacenter_project_id`
    - `jira_stage_bearer_token`
    - `jira_stage_datacenter_url`

- `export_to_jira_cloud.test.ts`
    - `jira_atlassian_cloud_project`
    - `jira_atlassian_cloud_email`
    - `jira_atlassian_cloud_token`
    - `jira_atlassian_cloud_url`

- `source_analysis.test.ts` and `binary_analysis.test.ts`
    - `git_user`
    - `git_password`

## Code formatting using Prettier tool

Husky and lint-staged are used to format staged files when committing.

To manually format the cypress code: `npm run format`

To manually check the code formatting: `npm run check`


## Pull request testing

1. Update Pull request with upstream main branch
2. Pull requests will be tested against environment before merging to main codebase
3. Pull request's owner must add **RFR** label once pull request is ready to test against environment
4. After adding **RFR** label, the PR owner should force push the pull request to trigger GitHub action
5. In some cases, the reviewer wants to trigger the PR test GH action but they can't force push to the PR branch. Hence added feature of triggering GH action manually. Steps to trigger GH action for PR testing manually:
   - Go to Actions tab
   - Click on GH action(Pull request test)
   - Click on run workflow dropdown
   - select PR branch
   - Click on button Run workflow

## Test runs
1. Click here to see **Old** test runs - [run1](https://dashboard.cypress.io/projects/cbdv4m/runs), [run2](https://dashboard.cypress.io/projects/dvmnpr/runs), [run3](https://dashboard.cypress.io/projects/1g7617/runs)

2. Click [here](https://reportportal-migration-qe.apps.ocp4.prod.psi.redhat.com) to see **Current** test runs

## Tag based test execution
This repository uses the package [cypress-tags](https://www.npmjs.com/package/cypress-tags) to slice up test runs.

1. To run tests based on tags, use below command
   ```sh
   CYPRESS_INCLUDE_TAGS=@tagName npx cypress run
   ```

2. To run multiple tags(tiers) in a single run, provide tag names separated by commas
   ```sh
   CYPRESS_INCLUDE_TAGS=@tier1,@tier2 npx cypress run
   ```

## Running tests locally with Konveyor operator installed to minikube

1. Install minikube on your local machine by referring to [docs](https://minikube.sigs.k8s.io/docs/start/)

1. Setup recommended minikube configurations and start minikube with the ingress addon
   ```sh
   minikube config set memory 10240
   minikube config set cpus 4
   minikube start --addons=ingress
   ```

1. Install kubectl if needed, or substitute `minikube kubectl --` for all `kubectl` commands.

1. Install [OLM manually](https://github.com/operator-framework/operator-lifecycle-manager/releases)
   ```sh
   curl -L https://github.com/operator-framework/operator-lifecycle-manager/releases/download/v0.28.0/install.sh -o install.sh
   chmod +x install.sh
   ./install.sh v0.28.0
   ```

1. Install the Konveyor operator ([operator install](https://github.com/konveyor/operator?tab=readme-ov-file#konveyor-operator-installation-on-k8s)) to the default namespace **konveyor-tackle**
   ```sh
   kubectl apply -f https://raw.githubusercontent.com/konveyor/operator/main/tackle-k8s.yaml
   ```

1. Create a Tackle CR (setting the spec values as needed)
   ```sh
   cat << EOF | kubectl apply -f -
   kind: Tackle
   apiVersion: tackle.konveyor.io/v1alpha1
   metadata:
     name: tackle
     namespace: konveyor-tackle
   spec:
     feature_auth_required: false
   EOF
   ```

1. Wait for the tackle ingress to become available
   ```sh
   kubectl wait -n konveyor-tackle ingress/tackle --for=jsonpath='{.status.loadBalancer.ingress[0]}' --timeout=600s
   ```

1. Once the Konveyor UI ingress is running, tests can be run against this local instance, with video captures of the tests turned on, using the command
   ```sh
   CYPRESS_baseUrl=https://$(minikube ip) npx cypress run --config video=true
   ```

## Tags and Tiers in Konveyor UI tests

### Tag Overview

Tests are tagged for selective execution based on purpose, stability, and resource requirements.

### Finding and Running Tests by Tag

Use the `findTierFiles.js` utility to locate and run tests with specific tags:

```bash
# Find all tier0 tests
node cypress/scripts/findTierFiles.js tier0

# Run tests for a specific tier
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier0)"

# Run tests for multiple tiers
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier0,interop)"
```

### Tag Definitions

#### `@ci` - Continuous Integration Tests
- **Purpose**: Runs on minikube for PR validation via [Konveyor CI](https://github.com/konveyor/ci)
- **Constraints**:
  - Limited resources (minikube environment)
  - Cannot use tests requiring external credentials
  - Time-constrained (must complete reasonably quickly)
- **Tests Include**:
  - Login and navigation validation
  - Business service CRUD
  - Job function CRUD
  - Stakeholder, stakeholder group, tag, and archetype CRUD operations
  - Application assessment, review, and analysis with effort and issues validation

**Usage**:
```bash
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js ci)"
```

#### `@tier0` - Basic Sanity Tests
- **Purpose**: Core smoke tests for critical functionality
- **Runs on**: Stage, production, and nightly on [Konveyor CI](https://github.com/konveyor/ci)
- **Tests Include**:
  - Custom migration targets CRUD and validation
  - Source analysis on bookserver app (without credentials)
  - Source + dependency analysis validation
  - Migration waves CRUD and application association

**Usage**:
```bash
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier0)"
```

#### `@tier1` - Analysis Tests with Credentials
- **Purpose**: Comprehensive analysis tests requiring external credentials
- **Runs on**: Nightly on [Konveyor CI](https://github.com/konveyor/ci)
- **Tests Include**:
  - Binary analysis with Git credentials
  - Source code analysis with credentials
  - Node.js application analysis
  - Python application analysis
  - Upload binary analysis

**Required Config**: Tests need `git_user` and `git_password` configured in `cypress.config.ts`

**Usage**:
```bash
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier1)"
```

#### `@tier2` - Comprehensive CRUD Tests
- **Purpose**: Full CRUD coverage for all features
- **Test Areas**: Administration (credentials, repositories, questionnaires), application inventory, controls, custom metrics, migration waves, task manager, RBAC, and analysis features

**Usage**:
```bash
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier2)"
```

#### `@tier3` - Sorting and Filtering Tests
- **Purpose**: Validate sorting, filtering, and UI interactions
- **Tests Include**:
  - Job function filters
  - Tag filters on application details
  - Manual package selection for analysis
  - Analysis with proxy configuration

**Usage**:
```bash
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier3)"
```

#### `@tier4` - Load and Performance Tests
- **Purpose**: Load testing and performance validation
- **Tests Include**:
  - Bulk analysis operations
  - Large dataset handling
  - Performance benchmarks

**Usage**:
```bash
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier4)"
```

#### `@interop` - Interoperability Tests
- **Purpose**: Used by interOp team for testing on ROSA, ROSA-STS, and ARO clusters
- **Tests Include**:
  - Source control credentials CRUD
  - Custom migration targets CRUD
  - Stakeholder CRUD operations

**Usage**:
```bash
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js interop)"
```

### Running Multiple Tags

To run tests from multiple tiers in a single execution:

```bash
# Run tier0 and tier1 together
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier0,tier1)"

# Run interop and tier0 tests
npx cypress run --spec "$(node cypress/scripts/findTierFiles.js tier0,interop)"
```

## License's header management
To check if the license's header is available in all eligible files, execute:
```shell
yarn license-check-and-add check
```

To add the license's header to all eligible files, execute:
```shell
yarn license-check-and-add add
```

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fkonveyor%2Ftackle-ui-tests.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fkonveyor%2Ftackle-ui-tests?ref=badge_large)

## Code of Conduct
Refer to Konveyor's Code of Conduct [here](https://github.com/konveyor/community/blob/main/CODE_OF_CONDUCT.md).

## Git branch mapping
|Branch|Mapping|
|-|-|
|mta_7.2.0|MTA 7.2.0|
|release-0.6|MTA 7.2.1|
|release-0.7|MTA 7.3.0|
|main|Upstream development branch|
