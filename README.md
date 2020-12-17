[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/UCSD-MASHED/chatapp)
<a href="https://codeclimate.com/github/UCSD-MASHED/chatapp/maintainability"><img src="https://api.codeclimate.com/v1/badges/3495656c5160e368951d/maintainability" /></a>
[![Test Coverage](https://api.codeclimate.com/v1/badges/3495656c5160e368951d/test_coverage)](https://codeclimate.com/github/UCSD-MASHED/chatapp/test_coverage)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/UCSD-MASHED/chatapp)
[![TaterTalk Cypress Test](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/xntes5&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/xntes5/runs)

- [TaterTalk](#tatertalk)
  - [Architecture](#architecture)
  - [Get Started](#get-started)
    - [Steps you should take](#steps-you-should-take)
    - [Resources for next steps](#resources-for-next-steps)
  - [Configurations](#configurations)
    - [Environment files](#environment-files)
      - [`.firebaserc`](#firebaserc)
      - [`.env.dev`](#envdev)
      - [`serviceAccount.json`](#serviceaccountjson)
    - [Workflow Setup](#workflow-setup)
  - [Scripts](#scripts)
    - [`yarn start`](#yarn-start)
    - [`yarn test`](#yarn-test)
    - [`yarn run cy:run`](#yarn-run-cyrun)
    - [`yarn run cy:open`](#yarn-run-cyopen)
  - [Code and JSDoc Documentation](#code-and-jsdoc-documentation)
  - [Testing](#testing)
    - [Jest](#jest)
    - [Cypress](#cypress)
    - [Code Coverage](#code-coverage)

# [TaterTalk](https://twotenchatapp.web.app/)

This is a chat web application that allows users to register/login with Google and provides 1 on 1 private chatting functionality.

## Architecture

`TODO`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and utilizes [Firebase](https://firebase.google.com/), more specifically, it relies on Firebase Authentication, Firestore and Hosting.

## Get Started

Welcome aboard! Below are the steps you need to take to get up and running, as well as relevant resources to consult.

### Steps you should take

1. Install [node](https://nodejs.dev/learn/how-to-install-nodejs).
2. Install [yarn](https://classic.yarnpkg.com/en/docs/install/).
3. Clone this repository.
4. If you are part of the team, we should have provided you with two files: [`.env.dev`](#envdev) and [`serviceAccount.json`](#serviceaccountjson) . Add both of these files to the root level of the repository. If you are not part of the team, please follow [Configurations](#configurations) section on how to configure these files.
5. Run `yarn install` to install our project's dependencies.
6. Start the local server by doing `yarn start` and explore!

You're all set! You can visit the [Scripts](#Scripts) section to learn more about other useful commands if you are interested.

### Resources for next steps

`TODO`

## Configurations

If you are not part of the team and would like to extend this app on your own, you should first create a Firebase app [here](https://firebase.google.com/). It's worth mentioning that we created two Firebase apps for our `main` and `dev` branches respectively. If you don't need it, you only need to create one Firebase app.

### Environment files

In order to run this app in full capacity, you will also need to add your own configuration files as explained below.

#### `.firebaserc`

This is the Firebase configuration file which specifies the corresponding Firebase project id.

Here is what it looks like:

Since we have two branches `main` and `dev` for production and development environments in our GitHub repository, we also created two apps on Firebase console and linked them to `prod` and `dev` config respectively.

```json
{
  "projects": {
    "default": "twotenchatapp",
    "prod": "twotenchatapp",
    "dev": "twotenchatapp-beta-a41e8"
  }
}
```

After creating your own Firebase app, you have to change the corresponding project id in this file. If you are only creating one Firebase app, you can remove `prod` and `dev` fields and only keep `default` field.

#### `.env.dev`

This is our local environment credential file that stores the necessary ENV variables.

This is what it should look like:

```
REACT_APP_APIKEY=...
REACT_APP_AUTHDOMAIN=...
REACT_APP_DATABASEURL=...
REACT_APP_PROJECTID=...
REACT_APP_STORAGEBUCKET=...
REACT_APP_MESSAGINGSENDERID=...
REACT_APP_APPID=1:...

CYPRESS_APIKEY=...
CYPRESS_AUTHDOMAIN=...
CYPRESS_DATABASEURL=...
CYPRESS_PROJECTID=...
CYPRESS_STORAGEBUCKET=...
CYPRESS_MESSAGINGSENDERID=...
CYPRESS_APPID=1:...
CYPRESS_TEST_UID=...
```

`*_APIKEY`, `*_AUTHDOMAIN`, `*_DATABASEURL`, `*_PROJECTID`, `*_STORAGEBUCKET`, `*_MESSAGINGSENDERID` and `*_APPID` are provided by the Firebase project you created. They are used to [initialize the Firebase app](https://firebase.google.com/docs/web/setup#add-sdks-initialize) using the Firebase SDK. You can read more about it in [here](https://support.google.com/firebase/answer/7015592) as well.

We prepend `REACT_APP_` to the environment variables introduced above so that they are imported by CRA automatically.

We also prepend `CYPRESS_` to the same environment variables so that they are imported by Cypress in test runs. We need them so that we can communicate with Firebase in our End to End environment.

`CYPRESS_TEST_UID` is needed for `cypress-firebase` so that it can log in as a test user through Firebase Authentication. See more details [here](https://github.com/prescottprue/cypress-firebase#cylogin).

#### `serviceAccount.json`

This is a JSON configuration file that was generated in Firebase. You can follow this [link](https://firebase.google.com/docs/admin/setup#initialize-sdk) for instructions. We need this file so that our third-party plugin [cypress-firebase](https://github.com/prescottprue/cypress-firebase) can utilize the firebase-admin SDK to test the Firebase project.

### Workflow Setup

We have several GitHub Actions [workflows](.github/workflows) configured in our repo. These workflows build, run, test, and deploy our project. In addition, they are configured to preview and deploy pull requests and merges into our dev branch to a second Firebase application - a "beta" app that we use as our development application. In addition to our workflows deploying to this beta app, they also deploy our JSDoc documentation, Jest coverage report, and Code climate report. Because our workflows are configured to work with this beta app and other resources, this means that our workflow files will not work for your project out-of-the-box.

If you would like to use our workflow setup as a template, you will need to set up Jest coverage, Code Climate, JSDoc, and a secondary "beta" app for your porject. For more information on how to do this, see the relevant sections and links at the end of this document.

If you would not like to use our workflow setup or would like to adapt it, be sure to update these files according to your desired workflows.

After setting up the environment files and your own workflow files, you should install all the project dependencies by doing `yarn install`. Once the installation is done, you should be able to utilize the commands in the Scripts section below.

## Scripts

### `yarn start`

Runs the app on your local machine.
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `yarn test`

Launches the unit test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn run cy:run`

Launches the Cypress test runner in command-line mode. See more details [here](https://docs.cypress.io/guides/guides/command-line.html#How-to-run-commands).

### `yarn run cy:open`

Launches the Cypress GUI test runner. See more details [here](https://docs.cypress.io/guides/getting-started/installing-cypress.html#Opening-Cypress).

## Code and JSDoc Documentation

If you are interested in our implementation, we have a JSDoc document website hosted [here](https://ucsd-mashed.github.io/TaterTalkDoc/) that documents all of our code for this project.

Learn how to configure JSDoc [here](https://jsdoc.app/about-configuring-jsdoc.html).

For reference, you can look at our `jsdoc.json` in the root directory for our own configuration of JSDoc.

## Testing

### Jest

We use [Jest](https://jestjs.io/docs/en/tutorial-react), combined with [react-testing-library](https://testing-library.com/docs/react-testing-library/example-intro/) for unit testing.

The goal here is to have at least one test case per each unit (function) so that we can be confident that all functions should behave as expected.

### Cypress

For our E2E tests, we decided to go with [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html#In-a-nutshell) because it's well-documented and provides good support for asynchronous tests and is easy to setup.

Learn how to configure Cypress [here](https://docs.cypress.io/guides/references/configuration.html).

It's worth mentioning that since E2E tests require talking to the actual backend server (in our case, this is Firebase), we also need to setup environment variables so that Cypress can test Firebase related features. The detailed configuration is covered [here](#envdev).

For reference, you can look at our `cypress.json` in the root directory for our own configuration of Cypress.

### Code Coverage

We combined both Jest and Cypress test coverages so that it truly reflects our comprehensive code coverage. If interested, please take a look at our [test coverage workflow](.github/workflows/test_coverage.yml).

The combined coverage report is also hosted via GitHub Pages [here](https://ucsd-mashed.github.io/TaterTalkCoverage/).
