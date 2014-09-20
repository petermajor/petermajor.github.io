---
layout: post
title: Writing better AngularJS promises
date: 2014-05-29 22:18:16
categories:
- AngularJS
tags:
- AngularJS
published: true
author: peter_major
sitemap:
  priority: 0.6
  changefreq: weekly
---
## $q

I think that AngularJS promises are pretty easy to pick up... the [documentation for $q](https://docs.angularjs.org/api/ng/service/$q) is pretty good.

However, a lot of AngurlarJS beginners write promises like they see in the documentation. Here is some script that I wrote that uses [Restangular](https://github.com/mgonto/restangular) to call a search API and return the results:

{% highlight js %}
angular.module('myApp.search.service', ['restangular'])
.factory('SearchService', ['$q', 'Restangular',
    function ($q, restangular) {

        function mapEntity(entity) {
            // snip
        }
        
        var service = {
            search: function (term) {
                var deferred = $q.defer();

                restangular
                    .all("search")
                    .getList({ term: term })
                    .then(function (searchResults) {
                        var mappedResults = searchResults.map(mapEntity);
                        deferred.resolve(mappedResults);
                    });

                return deferred.promise;
            }
        };

        return service;
    }]);
{% endhighlight %}

<!--more-->

Great! I learned to use the promise API like they do in the samples. However it can be written much more succinctly:

{% highlight js %}
angular.module('myApp.search.service', ['restangular'])
.factory('SearchService', ['Restangular',
    function (restangular) {

        function mapEntity(entity) {
            // snip
        }
        
        var service = {
            search: function (term) {

                return restangular
                    .all("search")
                    .getList({ term: term })
                    .then(function (searchResults) {
                        return searchResults.map(mapEntity);
                    });

            }
        };

        return service;
    }]);
{% endhighlight %}

In the second sample, I've managed to get rid of $q completely. The important thing to note is that there is no need to called __deferred.resolve()__... just return the object you want to be passed into the next __then()__ in the promise chain.

Here's another script I wrote earlier in my AngularJS career that simulates a slow API call:

{% highlight js %}
angular.module('myApp.search.service', [])
.factory('SearchService', ['$q', '$timeout',
    function ($q, $timeout) {
        
        var service = {
            search: function (term) {
                var deferred = $q.defer();
 
                $timeout(function() {
                    deferred.resolve([{ name: "result 1" }]);
                }, 1000);
 
                return deferred.promise;
            }
        };
 
        return service;
    }]);
{% endhighlight %}

The interesting thing about [$timeout](https://docs.angularjs.org/api/ng/service/$timeout) is that it returns a promise and the value that this promise will be resolved with is the return value of the timeout function. That might sound a bit confusing, so let me just show you:

{% highlight js %}
angular.module('myApp.search.service', [])
.factory('SearchService', ['$timeout',
    function ($timeout) {
        
        var service = {
            search: function (term) {
 
                return $timeout(function() {
                    return [{ name: "result 1" }];
                }, 1000);
            }
        };
 
        return service;
    }]);
{% endhighlight %}

Look, no $q again!

In fact, the general rule I go by is the only time I should ever have to use $q is... never!

That's not exactly true... if I was to write the mock search service above without a timeout, I might write this:

{% highlight js %}
angular.module('myApp.search.service', [])
.factory('SearchService', ['$q',
    function ($q) {
        
        var service = {
            search: function (term) {
                var deferred = $q.defer();
 
                deferred.resolve([{ name: "result 1" }]);
 
                return deferred.promise;
            }
        };
 
        return service;
    }]);
{% endhighlight %}

Then again, even that could be more succinct:

{% highlight js %}
angular.module('myApp.search.service', [])
.factory('SearchService', ['$q',
    function ($q) {
        
        var service = {
            search: function (term) {

                return $q.when([{ name: "result 1" }]);
 
            }
        };
 
        return service;
    }]);
{% endhighlight %}

__$q.when()__ is used to ensure that the value being returned is a promise. If the value passed into __when()__ is already a promise then the original promise is returned. If the value passed into __when()__ is not a promise then it will be wrapped in a promise.

## Summary

When I first learned to use AngularJS promises, I used $q as described in the documentation. However, once you become more familiar with the promise API you can write clearer and succinct script without $q.
