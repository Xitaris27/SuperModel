# qa-shared-base

[![Code Climate](https://codeclimate.com/repos/586fc8e34bd91e580300187c/badges/f85cf9b2923530030e86/gpa.svg)](https://codeclimate.com/repos/586fc8e34bd91e580300187c/feed) [![Test Coverage](https://codeclimate.com/repos/586fc8e34bd91e580300187c/badges/f85cf9b2923530030e86/coverage.svg)](https://codeclimate.com/repos/586fc8e34bd91e580300187c/coverage) [![Issue Count](https://codeclimate.com/repos/586fc8e34bd91e580300187c/badges/f85cf9b2923530030e86/issue_count.svg)](https://codeclimate.com/repos/586fc8e34bd91e580300187c/feed)

This project contains the basic common functionality for protractor UI tests. As this is the base level this project will contain only those things that will apply to all tests.

Examples of things found in this project:
  - logging in test users
  - starting up browsers
  - communicating with SauceLabs
  - setting cookies and experiments
  - logging and other configuration tasks.

Data creation methods will be found inside the common project of the team that owns the data. For example, qa-shared-links is where you’d look to find methods relating to creating sources while qa-shared-tree is the place to look for creating people.  qa-shared-base-utils is where you'd look for popular and useful protractor functions that we've come up with.


### Creating a test project that uses this common library
Shared base has been updated to work with protractor 5.
This requires that you have node 6.9.x or above.

This section assumes that protractor and node.js is already installed on your machine.  If not go here: [Node.js][nodeLink] before continuing.  When node is done installing open a terminal window and enter this command: ```npm install -g protractor```
Once Node and Protractor are setup you'll need to setup a test project.  This is just a standard .js project you'd create in whatever ide you desire.  However there are a couple of required files needed to access the common library.
  - config.json - this is your config file.  See here for a sample: [config.json][confJsonLink]
  - baseConf.js - this is a replacment for protractor's conf.js file.  Here's the code to copy into your own: [baseConf.js][protractorConfLink]
  - Also inside the test project's package.json this dependency should be added:  ```"qa-shared-base": "git+https://github.com/fs-eng/qa-shared-base.git"```  Here's a sample package.json:  [package.json][packageLink]
  - Here is a link to a sample project with tests and files: [Sample Project][sampleProjectLink]

Also check out the [base-cli](https://github.com/fs-eng/base-cli),
a command-line tool for easily installing and using the shared base.

Write your tests and make sure that the paths to each test file are included in the conf.json and local.json suites line. (see the above example conf.json)

### Accessing common code inside tests:
  - Use this require statement to access the common library methods:
  ```
      var qa = new (require('qa-shared-base/lib/protractor-lib.js'));
  ```
  - See here for another example test: [SourceTitleTest.js][sampleTest]

### Launching tests and configuration
  - Follow the instructions here: [Running and settings][confluenceLocalLink]

### Navigating this project:
  - lib/config - contains the code for configuring the common library to run.  This manages what browser, where to run and other configuration needed to run tests.
  - lib/extensions - contains utilites that all teams should use - setting cookies and experiements.  The code here differs from the QA-Shared-BaseUtils project in that BaseUtils is an optional project whereas this one is required to run tests.
  - lib/login - contains the code for logging in users
  - protractor-lib.js - the wrapper for all of the above files.  This is what the test will require to access common library methods.  ex:
      ```
      var qa = new (require('qa-shared-base/lib/protractor-lib.js'));
      ```

### Adding tests to team's deploy
In the blueprint.yml you will need to add line in points to another file in the webdev's project like this: - bin/testbeta. With 1.0 you can add this to the validate session [Blueprint Schema 1.0][confluenceBlue1Link] and for 0.3 see [Blueprint 0.3 Wedeev][confluenceBlue3Link].
In that file that you point to in your blueproint you will want to have some thing like this:
  ```
  #!/usr/bin/env bash

  # fail fast
  set -o errexit
  set -o pipefail

  git clone https://github.com/fs-eng/qa-help.git ui-beta 2>&1
  cd ui-beta
  npm install

  ./node_modules/qa-shared-base/node_modules/protractor-flake/bin/protractor-flake --parser multi -- ./baseConf.js --params.config=sauce,ask-beta 2>&1
  ```
NOTE: You will what this file to have permissions of -rwxr-xr-x which can be done by chmod 755 {File name}. On windows good luck https://www.cygwin.com/.


[nodeLink]: <https://nodejs.org/en/>
[protractorLink]: <https://angular.github.io/protractor/#/>
[confJsonLink]: <https://github.com/fs-eng/qa-shared-example/blob/master/config.json>
[localJson]: <https://github.com/fs-eng/qa-shared-example/blob/master/local.json>
[protractorConfLink]: <https://github.com/fs-eng/qa-shared-example/blob/master/baseConf.js>
[packageLink]: <https://github.com/fs-eng/qa-shared-example/blob/master/package.json>
[baseEncode]: <https://www.base64encode.org/>
[sampleTest]: <https://almtools.ldschurch.org/fhconfluence/display/FHQA/Sample+Test>
[confluenceSauceLink]: <https://almtools.ldschurch.org/fhconfluence/display/FHQA/Running+against+SauceLabs>
[confluenceLocalLink]: <https://almtools.ldschurch.org/fhconfluence/display/FHQA/Running+Tests>
[confluenceBlue1Link]: <https://almtools.ldschurch.org/fhconfluence/display/EPT/Blueprint+Schema+-+Version+1.0>
[confluenceBlue3Link]: <https://almtools.ldschurch.org/fhconfluence/display/EPT/Blueprint+0.3+WebDev>
[sampleProjectLink]: <https://github.com/fs-eng/qa-shared-example>
