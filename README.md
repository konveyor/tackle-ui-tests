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

1. Update Pull request with upstream main branch
2. Pull requests will be tested against environment before merging to main codebase
3. Pull request's owner must add **RFR** label once pull request is ready to test against environment
4. After adding 'RFR' label; Owner should force push the pull request to trigger GitHub action
5. In some cases, reviewer wants to trigger the PR test GH action but he/she can't force push the branch. Hence added feature of triggering GH action manually. Steps to trigger GH action for PR testing manually :- Go to Actions tab > Click on GH action(Pull request test) > Click on run workflow dropdown > select PR branch > Click on button Run workflow

#### Test runs
1. Click here to see **Old** test runs - [run1](https://dashboard.cypress.io/projects/cbdv4m/runs), [run2](https://dashboard.cypress.io/projects/dvmnpr/runs), [run3](https://dashboard.cypress.io/projects/1g7617/runs)

2. Click [here](https://reportportal-migration-qe.apps.ocp4.prod.psi.redhat.com) to see **Current** test runs

#### Tag based test execution
1. To run tests based on tags, use below command - 

    `npx cypress run --env grepTags=@tagName`

2. To run multiple tags(tiers) in a single run, provide tag names appended in below format - 

    `npx cypress run --env grepTags=@tag1+@tag2`

#### Running tests locally over Tackle UI hosted on minikube

1. Install minikube on your local machine by referring to [docs](https://minikube.sigs.k8s.io/docs/start/)
2. Start minikube by specifying needed addons and kubernetes version using below command

    `minikube start --addons=registry --addons=ingress --kubernetes-version v1.20.2`

3. Create new namespace for deploying Tackle UI

    `kubectl create ns $tackleNamespace`

4. Save the yaml from tackle [repo](https://github.com/konveyor/tackle/blob/main/kubernetes/kubernetes-tackle.yaml) locally, eg - /tmp/tackle/tackle.yaml

    `kubectl create -f /tmp/tackle/tackle.yaml -n $tackleNamespace`

5. Wait for some time to let deployment finish and extract the Tackle UI web page url (typically an IP) using command - 

    `kubectl get ingress tackle --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}" -n $tackleNamespace`

6. Once the Tackle UI is running on above address, tests can be run against this local instance using below command -

    `npx cypress run --config video=false --browser /path/to/your/browser`

### License's header management
To check if the license's header is available in all eligible files, execute:
```shell
yarn license-check-and-add check
```

To add the license's header to all eligible files, execute:
```shell
yarn license-check-and-add add
```


## Code of Conduct
Refer to Konveyor's Code of Conduct [here](https://github.com/konveyor/community/blob/main/CODE_OF_CONDUCT.md).
