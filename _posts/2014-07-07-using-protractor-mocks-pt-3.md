---
layout: post
title: Using Protractor mocks for AngurlarJS tests without backend (pt. 3)
date: 2014-07-07 09:01:24
categories:
- AngularJS
tags:
- AngularJS
- Protractor
published: true
author: peter_major
comments: true
sitemap:
  priority: 0.6
  changefreq: weekly
---
This is part 3 of a 3 part series: [part 1]({% post_url 2014-05-25-using-protractor-mocks-pt-1 %}), [part 2]({% post_url 2014-05-25-using-protractor-mocks-pt-2 %})

## Recap

In the last post I showed how to write Protractor mocks to test an AngularJS application without a live back-end system.

In the sample application on [Github](https://github.com/petermajor/ProtractorWithoutBackend), I mocked out a response to a GET API call and tested that the application displayed the results in the AngularJS application correctly.

That worked well for the mocking out the GET, but what about applications that are CRUD (create/read/update/delete) in nature? To test this type of application you would also want to mock these type of calls also.

Also, how can you test how your application behaves when your API returns errors - like "Not Found" (404), "Precondition Failure" (412) etc?

<!--more-->

## Code sample

I recently wrote another series of posts on [implementing optimistic concurrency]({% post_url 2014-06-05-restangular-and-etags-pt2 %}) with AngularJS and Web API.

I've taken the code sample for that article and I've written Protractor tests for two scenarios : updating an entity (PUT) and concurrency error on updating an entity (412 - Precondition failed) .

Please clone the [RestangularWithEtag](https://github.com/petermajor/RestangularWithEtag) repository while following this post. All of the Protractor tests for the "edit employee" page are in __tests\web\employee\employee_specs.js__.

## Mocking the GET

The first test we'll look at is just mocking out the GET call when the "edit page" is first shown:

{% highlight js %}
it('when I navigate to an employee then I see the employee details in the page', function () {

    ptor.addMockModule('httpBackEndMock',
        mock.build([employeeMock.getEmployeeDonaldTrump]));

    employeePage.navigateEdit("2");

    employeePage.expectNameToBe("Donald Trump");
    employeePage.expectEmailToBe("rich@gmail.com");
});
{% endhighlight %}

The first thing to notice about this test is that all of the WebDriver code to set values in controls / extract values from controls / evaluate expectations has been encapsulated into a page object.

This is for two reasons:

1. The test reads like a bunch of sentences. Even someone who doesn't know WebDriver / Protractor syntax could probably understand this test (except maybe for the slightly cryptic mock statment at the top)
2. To reuse code between tests. Imagine that the id of a control changes. Rather than search and replace through all of the tests for __by.css("#nameInput")__, you can just update one line in your page object and all of the tests that use that page object don't need to be modified.

I could have written the test like this... which one would you rather read?

{% highlight js %}
it('when I navigate to an employee then I see the employee details in the page', function () {

    ptor.addMockModule('httpBackEndMock',
        mock.build([employeeMock.getEmployeeDonaldTrump]));

    browser.get('/employee?id=2');

    expect(element(by.css('#nameInput')).getAttribute("value"))
        .toEqual("Donald Trump");
    
    expect(element(by.css('#emailInput')).getAttribute("value"))
        .toEqual("rich@gmail.com");
});
{% endhighlight %}

As per the previous post in the series, I've used __mock.build()__ defined in __tests\web\setupMocks\mock.js__ to inject a function into the AngularJS application to respond to an HTTP GET:

{% highlight js %}
module.exports.getEmployeeDonaldTrump = function ($httpBackend) {

    var employee = { Id: 2, Name: "Donald Trump", Email: "rich@gmail.com" };

    $httpBackend.whenGET('/api/employees/2').respond(employee);
};
{% endhighlight %}

When the test runs, the page will look like this:

[![GetEmployee](/assets/GetEmployee2.png){:.img-300-265 width="300" height="265"}](/assets/GetEmployee2.png)

The test verifies that the values in the inputs are correct and that's it.

## Mocking the PUT

Next we want to test that if we change a value and then click save, the updated employee entity is sent to the API. Here's the test:

{% highlight js %}
it("when I change the name and click 'save' then the changes are saved",
    function () {

    ptor.addMockModule('httpBackEndMock', 
        mock.build([
            employeeMock.getEmployeeDonaldTrump,
            employeeMock.expectPutDonnieTrump
        ]));

    employeePage.navigateEdit("2");

    employeePage.setName("Donnie Trump");

    employeePage.clickSaveButton();

    mock.verifyNoOutstandingExpectation();
});
{% endhighlight %}

Hopefully this test is as easy to read as the GET test. There are two lines of code that require further explanation: setting up the PUT expectation and verifying that expectation.

### Setting up the PUT expectation

As in the previous test, we setup a response to the GET request that happens when the edit page is loaded with __employeeMock.getEmployeeDonaldTrump()__.

Now we need to setup an expectation that when the Save button is clicked, that PUT will be called on the API. Additionally, we can specify what the response to the PUT request will be:

{% highlight js %}
module.exports.expectPutDonnieTrump = function ($httpBackend) {
    
    $httpBackend.whenPUT('/api/employees/2').respond(
    	function(method, url, data, headers) {
            return [200, data, {}];
        });

    var expected = { Id : 2, Name : "Donnie Trump", Email : "rich@gmail.com" };
    $httpBackend.expectPUT('/api/employees/2', expected);

};
{% endhighlight %}

If you've ever written any AngularJS unit tests with $httpBackend, this should look familiar. 

In the __whenPUT()__ call, we're telling the mock framework to allow PUT on the specified endpoint.

If that endpoint is called, then it will return a status code of 200.

Additionally, the response payload will be "data" - which is passed into the "respond" delegate and it is the payload of the request. 

So in this case we're just returning the request payload as the response payload.

This in important, if you were mocking out a POST request, you'd want to modify the payload so that it will have an "Id" - since most CRUD implementations of a POST will generate an "Id".

The __whenGET()__ call does not require that method to be called, it only details the response if it does get called.

That's where the call to __expectPUT()__ comes in... this says that we're expecting this call.

If I call __$httpBackend.verifyNoOutstandingExpectation()__ and all of the expected methods have not be satisfied, then an error will be raised.

The cool thing about the expect* methods is that they don't just check the URL, the can optionally check the payload too.

In the example above, we're constructing a new object with our "expected" payload and passing that to expectPUT. If they object doesn't match exactly, then an error will be raised.

If you don't want to check the whole object, you can use a regex to check the payload JSON for just the properties you're interested in.

### Verifying the PUT expectation

So we've used __expectPUT()__ to setup our expectation that the PUT method will be called and with the correct payload.

The only problem is that that expectation has been injected into the AngualarJS application as a script from the Protractor process.

If that expectation raises an error, that error does not make it's way back to Protractor. We have to write a script that will transfer that error back to Protractor.

That's where __mock.verifyNoOutstandingExpectation()__ comes in:

{% highlight js %}
module.exports.verifyNoOutstandingExpectation = function () {
    var message = browser.executeAsyncScript(verifyNoOutstandingExpectationFunction);
    expect(message).toBeNull();
};

var verifyNoOutstandingExpectationFunction = function(callback) {
    var $httpBackend = angular.element('body')
        .injector().get('$httpBackend');
    try {
        $httpBackend.verifyNoOutstandingExpectation();
        callback(null);
    } catch (err) {
        callback(err.message);
    }
};
{% endhighlight %}

__mock.verifyNoOutstandingExpectation()__ works by injecting a function into AngularJS that will check unmatched expectations in the browser and transfer any error messages back to Protractor.

## Mocking the concurrency error

The original purpose of this sample was to show how you can build optimistic concurrency into your AngularJS application. We should definitely have a test for that!

{% highlight js %}
it("when I attempt to change an employee that has been changed by someone else then I see a error message and the changes are not saved",
    function () {

    ptor.addMockModule('httpBackEndMock',
        mock.build([
            employeeMock.getEmployeeDonaldTrump,
            employeeMock.expectPutConcurrencyError]));

    employeePage.navigateEdit("2");

    employeePage.setName("Donnie Trump");

    employeePage.clickSaveButton();

    employeePage.expectModalIsShowing();

    employeePage.clickModalOkButton();

    employeePage.expectModalIsNotShowing();

    mock.verifyNoOutstandingExpectation();
});
{% endhighlight %}

Again, nice readable Protractor test with everything hidden in the page object. The only thing interesting in this test is the call to __employeeMock.expectPutConcurrencyError()__.

{% highlight js %}
module.exports.expectPutConcurrencyError = function ($httpBackend) {
    
    $httpBackend.whenPUT('/api/employees/2').respond(412);

};
{% endhighlight %}

The important thing to note here is that the response code is NOT 200, it's 412.

This is the "Precondition Failed" error status that the API uses to indicate to the AngularJS application that there has been a concurrency error while attempting to update the employee entity.

The application handles this case with the following logic:

{% highlight js %}
$scope.saveFailure = function (reason) {
    if (reason.status === 412) {
        $scope.showConcurrencyError();
    } else {
        alert("failure - status: " + reason.status);
    };
}
{% endhighlight %}

If you run the tests, you will see a Bootstrap modal popping up at this point to inform the user that there has been a concurrency error.

If you application shows special messages to users on 404 (Not Found) or other errors, this is how you setup the mock to test these conditions.

## Wrapping Up

There are a few things that I really like about AngularJS.

If I had to name one and only one, I'd pick the ability to easily write UI tests without a live back-end system.

I can't imagine how I would replace HTTP calls from ASP.NET MVC to a Web API with canned responses.

I guess I'd have to run a fake API for which I could somehow return preconfigured responses.

These UI tests that I've written have caught a whole bunch of bugs that I've created when I inevitably refactor my javascript and break a binding - these are bugs that "unit" tests just don't catch.

In fact, I don't write any "unit" tests for my AngularJS application at all - I just write these Protractor tests.
