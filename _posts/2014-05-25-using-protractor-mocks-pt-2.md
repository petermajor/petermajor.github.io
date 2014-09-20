---
layout: post
title: Using Protractor mocks for AngurlarJS tests without backend (pt. 2)
date: 2014-05-25 15:10:59
categories:
- AngularJS
tags:
- AngularJS
- Protractor
- web development
published: true
author: peter_major
sitemap:
  priority: 0.6
  changefreq: weekly
---

This is part 2 of a 3 part series: [part 1]({% post_url 2014-05-25-using-protractor-mocks-pt-1 %}), [part 3]({% post_url 2014-07-07-using-protractor-mocks-pt-3 %})

## The Application

Before we look at the Protractor mocks, let's have a look at the sample application we're going to test:

1. Clone my sample application at [GitHub](https://github.com/petermajor/ProtractorWithoutBackend)
2. Open the solution In Visual Studio 2013 and press F5 to run the application.
3. Once the web page appears, type __w7__ and click the __search__ button. You should see a couple of restaurants listed:<br />
[![List of restaurants](/assets/SearchW7.png){:.img-300-209 width="300" height="209"}](/assets/SearchW7.png)
4. Change the search term to __xxx__ and click the __search__ button again. You should now see a "not found" message:<br />
[![Not found](/assets/SearchXxx.png){:.img-300-146 width="300" height="146"}](/assets/SearchXxx.png)

<!--more-->

The AngularJS application is calling the REST API that is hosted in the application.The javascript for this call is in __restaurant.service.js__. I'm using a library called [Restangular](https://github.com/mgonto/restangular) because it's awesome, but I could have used __$http__. It's important to note the Restangular uses $http under the covers.

The REST API is hard-coded to return two restaurants - in real life this would be hitting a database or calling another service.

## Protractor mocks

Now on to the tests. If you examine __\tests\web\restaurant\restaurant_specs.js__, you'll see two tests: one test for a valid postcode and one test for an invalid postcode.

Let's have a look at the valid postcode test:

{% highlight js %}
it('when I type in a valid postcode then I see a list of restaurants sorting by rating DESC.', function () {
    ptor.addMockModule('httpBackEndMock', backEndMocks.build([backEndMocks.w7Restaurants]));

    restaurantPage.navigate();

    restaurantPage.searchInput.sendKeys('w7');
    restaurantPage.searchButton.click();

    var restaurants = restaurantPage.getRestaurants();
    expect(restaurants.count()).toBe(2);
    
    var restaurant1 = restaurants.get(0);
    expect(restaurantPage.getRestaurantTitle(restaurant1).getText()).toBe("Pete's Restaurant");

    var restaurant2 = restaurants.get(1);
    expect(restaurantPage.getRestaurantTitle(restaurant2).getText()).toBe("Bob's Restaurant");
    
    expect(restaurantPage.noResultsFoundLabel.isPresent()).toBeFalsy();
});
{% endhighlight %}

The first line is the key: __ptor.addMockModule__. Here we're telling Protractor to send the following script to the browser, replacing all scripts in the AngularJS module __httpBackEndMock__ of our application with the provided script. In the case of our first test, there is no module __httpBackEndMock__ in our application, so this script will be added. This script will contain our back-end mock - we'll examine that in a second.

If you examine the second test (the invalid postcode test) you'll see a similar line:

{% highlight js %}
it('when I type in an invalid postcode then I see not found message', function () {
    ptor.addMockModule('httpBackEndMock', backEndMocks.build([backEndMocks.xxxRestaurants]));

    /* snip */
});
{% endhighlight %}

Notice we are replacing the same module __httpBackEndMock__. This is important, as we have to __replace__ the module from the valid postcode test (otherwise it would still be in the application). However, the script for the invalid postcode test is different from the valid postcode test - __backEndMocks.w7Restaurants__ (valid test) and __backEndMocks.xxxRestaurants__ (invalid test).

Those two functions, __backEndMocks.w7Restaurants__ and __backEndMocks.xxxRestaurants__ are defined in __httpBackEndMocks.js__:

{% highlight js %}
module.exports.w7Restaurants = function ($httpBackend) {

    var restaurants = [
        { Id: 1, Name: "Bob's Restaurant", RatingStars: 2.5 },
        { Id: 2, Name: "Pete's Restaurant", atingStars: 5.5 },
    ];
    $httpBackend.whenGET('/api/restaurants?postcode=w7').respond(restaurants);
};

module.exports.xxxRestaurants = function ($httpBackend) {

    var restaurants = [];
    $httpBackend.whenGET('/api/restaurants?postcode=xxx').respond(restaurants);
};
{% endhighlight %}

This is standard __$httpBackend__ mocking usually used for AngurlarJS in unit tests. You can read more about $httpBackend in the AngurlarJS [documentation](https://docs.angularjs.org/api/ngMock/service/$httpBackend).

So this is injecting a script into our AngularJS application to respond to certain HTTP requests with the following code, rather than making a real HTTP call.

If another call is made that does not match the URL, the $httpBackend framework will raise an exception. That's why we need to inject in this code too:

{% highlight js %}
function passThrough($httpBackend) {
    $httpBackend.whenGET(/^\/scripts\//).passThrough();
};
{% endhighlight %}

We have to allow the application to call the server to get files from the __scripts__ folders. This is because AngularJS loads templates from the web server via the __$http__ service, just like any other API call. These files are part of the application, but $httpBackend is extremely literal - it will only allow $http calls that you setup.

One last point about $httpBackend: it is essential that the script __angular-mocks.js__ is referenced in your AngularJS application. You can see that in this sample by looking at the __BundleConfig.cs__ file.

There's just one bit of magic we haven't covered - how we actually inject the mocking functions __backEndMocks.w7Restaurants__ and __backEndMocks.xxxRestaurants__ into the application: the __backEndMocks.build__ function:

{% highlight js %}
module.exports.build = function(funcs) {
	var funcStr = "angular.module('httpBackEndMock', ['ngMockE2E'])";

    if (Array.isArray(funcs)) {
    	for (var i = 0; i &lt; funcs.length; i++) {
    		funcStr += "\r.run(" + funcs[i] + ")"
    	};
    } else {
  		funcStr += "\r.run(" + funcs + ")"
    }

    funcStr += "\r.run(" + passThrough + ")";

    var funcTyped = Function(funcStr);

    return funcTyped;
}
{% endhighlight %}

This function converts the mock function into a string and encloses it into an __angular.run()__ block - which runs when the AngurlarJS application initializes. The resultant string is what actually gets injected into the application:

{% highlight js %}
function anonymous() {
angular.module('httpBackEndMock', ['ngMockE2E'])
.run(function ($httpBackend) {

    var restaurants = [
        { Id: 1, Name: "Bob's Restaurant", RatingStars: 2.5 },
        { Id: 2, Name: "Pete's Restaurant", atingStars: 5.5 },
    ];
    $httpBackend.whenGET('/api/restaurants?postcode=w7').respond(restaurants);
})
.run(function passThrough($httpBackend) {
    $httpBackend.whenGET(/^\/scripts\//).passThrough();
})
}
{% endhighlight %}

## Running the tests

So now you know how I've implemented the tests so that the back-end calls are mocked. How do you actually run the tests?

__EDIT: The original post used powershell to install and run the protractor tests. Since that post I have updated the samples to use node.js to install protractor and grunt to run the tests. Please see the README.md on [github](https://github.com/petermajor/ProtractorWithoutBackend) for instructions on how to install and run the tests.__

<span style="color: #c0c0c0;">There is a PowerShell script to install Protractor called __InstallProtractor.ps1__. This script requires node.js to be installed. Note that to run Protractor, Java must be installed and java.exe must be in the system path.</span>

<span style="color: #c0c0c0;">There is another PowerShell script to run the Protractor tests called __RunProtractorTests.ps1__. This script will start a dedicated copy of IIS Express that will host the AngularJS application. So there's no need to mess around with IIS and create virtual applications etc.</span>

You'll probably notice that the first test takes around 15-20 seconds to run. It takes a while to launch Chrome and for IIS Express to initialize the application. However, subsequent tests are very speedy. For my project at work, we run around 200 UI tests in around 10 minutes - not as quick as unit tests, but still doable for a commit build.

## Summary

I'm a firm believer in testing behavior, not implementation. For a web application, I think one way this can be achieved is to drive tests from the UI and mock __external ports__ like API calls.

With AngularJS and Protractor this is very easy due to the way that Protractor can inject mock modules at runtime into an AngularJS application.

This is just one more reason why I love working with AngularJS so much!

In my [next post]({% post_url 2014-07-07-using-protractor-mocks-pt-3 %}), I'm going to show you how to mock PUTs and errors

