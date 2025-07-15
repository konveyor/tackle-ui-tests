## End-to-end Cypress tests for Konveyor UI
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fkonveyor%2Ftackle-ui-tests.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fkonveyor%2Ftackle-ui-tests?ref=badge_shield)


## Getting Started

### Requirements
1. Operating system (typically Fedora or MacOS)
2. Install Node.js 20 or above (OS native packages, or [nodejs](https://nodejs.org/en/download), or [nvm](https://github.com/nvm-sh/nvm) managed installs are all ok)

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

1. Wait for some time to let deployment finish and get Konveyor UI's ip address
   ```sh
   kubectl get -n konveyor-tackle ingress tackle -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
   ```

1. Once the Konveyor UI is running on above address, tests can be run against this local instance, with video captures of the tests turned on, using the command
   ```sh
   CYPRESS_baseUrl=https://$(minikube ip) npx cypress run --config video=true
   ```

## Tags and Tiers in Konveyor UI tests

### Tags

### `@interOp` tag: (Used by interOp team, rosa, rosa-sts, aro clusters)

Tests include:
  - “Creating source control credentials with username/password”
  - “Custom Migration Targets CRUD operations”
  - “Analysis for acmeair app upload binary”
  - “Test inheritance after discarding application assessment and review”
  - “Business service CRUD operations”
  - “Stakeholder CRUD operations”
  - “Migration Waves CRUD operations”

### `@ci` tag:
- Runs on minikube for CI testing https://github.com/konveyor/ci
- Running tests on github actions on minikube has some constraints like
  1) Limited resources
  2) Cannot run tests with credentials
  3) Time taken to run CI tests

Considering the above factors, we are including tests that are most necessary to test functionality of MTA while merging a PR. More tests will be added here once they're stabilized.

Tests include:
  - “Source Analysis on bookserver app and its issues validation” (Current Time taken - 20-30 mins)

### `@tier0` tag:
Basic sanity tests.  Runs on stage and production and nightly runs on [Konveyor CI](https://github.com/konveyor/ci).

Tests include:
  - “Creating source control credentials with username/password
  - ”Custom Migration Targets CRUD operations
  - “Source Analysis on bookserver app and its issues validation”
  - “Source analysis on bookserver app with EAP8 target”
  - “Test inheritance after discarding application assessment and review”
  - “Business service CRUD operations”
  - “Migration Waves CRUD operations”

### `@tier1` tag:
Includes analysis tests like binary and source+dependencies with credentials, runs on nightly [Konveyor CI](https://github.com/konveyor/ci).

### `@tier2` tag:
CRUD tests for all functionality

### `@tier3` tag:
Sorting/filtering for all functionality

### `@tier4` tag:
Load and performance tests.

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
