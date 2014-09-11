---
layout: post
title: Report Protractor Test Results on TeamCity
date: 2014-07-27 22:41:56
categories:
- AngularJS
tags:
- Protractor
- TeamCity
published: true
author: peter_major
---
## Jasmine

You're probably using Jasmine to run your Protractor tests.

By default, Jasmine reports test results in a human readable form:

[![Default reporting in Protractor](assets/protractor_default.png){:.img-680-346 width="510" height="258"}](assets/protractor_default.png)

While this is great for us, it doesn't mean a lot to TeamCity. If you use the default configuration these tests will not show up on the builds 'Test' tab.

Show how can you report Protractor test results on TeamCity?

The good news is that TeamCity expects a standard format for reporting test results.

If your testing framework can emit test results in this format then TeamCity will show the results in the "Tests" tab of the TeamCity UI.

<!--more-->

## jasmine-reporters

Even better news: somebody has already written a node package that will emit Jasmine test results in TeamCity format (link to jasmine-reporters).

To activate "jasmine-reports":

* add __jasmine-reporters__ package to your __package.json__:
{% highlight json %}
{
  "name": "protractor-without-backend",
  "description": "Using Protractor mocks for AngurlarJS tests without backend",
  "version": "0.0.0",
  "author": {
    "name": "Peter Major",
    "email": "peter@petermajor.co.uk"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/petermajor/ProtractorWithoutBackend.git"
  },
  "devDependencies": {
    "protractor": ">=0.14.0-0 <1.0.0",
    "grunt": "~0.4.1",
    "grunt-cli": "~0.1.13",
    "grunt-protractor-runner": "~1.0.0",
    "grunt-iisexpress": "*",
    "jasmine-reporters": "<2.0.0"
  },
  "scripts": {
    "postinstall": "webdriver-manager update",
    "test": "grunt test"
  }
}
{% endhighlight %}
* in the __onPrepare()__ method of your protractor config file, load the __jasmine-reporters__ module and add the __teamcity__ reporter to jasmine reporters collection:
{% highlight js %}
exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    './**/*_specs.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:55555/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },

  onPrepare: function() {
      require('jasmine-reporters');
      jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
  }
};
{% endhighlight %}

Now when we run our tests, the results are a lot less readable (to us):

[![TeamCity reporting in Protractor](assets/protractor_reporter.png){:.img-509-448 width="509" height="448"}](assets/protractor_reporter.png)


However, to they now show up in TeamCity:

[![Protractor results showing in TeamCity](assets/teamcity.png){:.img-440-220 width="494" height="220"}](assets/teamcity.png)

One thing to note if the test __duration__. My protractor tests are pretty fast, but they're not running in <1 ms LOL. I'll have to look into why the durations are reported so low.

## Conditionally using jasmine-reporters

Ideally the tests results would be in default Jasmine output for me and in TeamCity format when run on the build agent.

This turns out to be very easy to implement.

TeamCity adds an environment variable to the processes that it spawns on build agents:

__TEAMCITY_VERSION__

All we have to do is check for the existence of this variable.

If it exists, add the Jasmine TeamCity reporter.

If it doesn't exist, keep the default reporter.

{% highlight js %}
exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    './**/*_specs.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:55555/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },

  onPrepare: function() {
    
    if (process.env.TEAMCITY_VERSION)
    {
      require('jasmine-reporters');
      jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
    }
  }
};
{% endhighlight %}
