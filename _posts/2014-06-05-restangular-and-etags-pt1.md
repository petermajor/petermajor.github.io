---
layout: post
title: Using Restangular and ETags for optimistic concurrency (pt. 1)
date: 2014-06-05 15:16:25
categories:
- AngularJS
tags:
- AngularJS
- ETag
- Restangular
published: true
author: peter_major
---

This is part 1 of a 2 part series: [part 2]({% post_url 2014-06-05-restangular-and-etags-pt2 %})

## Restangular and ETags

I've mentioned [Restangular](https://github.com/mgonto/restangular) in a couple of previous posts. It's a really cool AngularJS service that simplifies access to REST back-end APIs.

One of the cool, but little talked about, features built into Restangular is support for ETags...

## What is an ETag and why do I want to use them?

[ETags](http://en.wikipedia.org/wiki/HTTP_ETag) were originally conceived for caching purposes.

<!--more-->

The idea is that when an HTTP server is queried for a resource, it will return the resource _as well as_ an __ETag__ header.

The ETag value is an opaque identifier for a specific version of a resource. If the resource changes, then the ETag must change.

The next time the server is queried for the resource by the same client, the client will include the last ETag in an __If-None-Match__ header.

If the ETag sent by the client is different than the currrent ETag of the resource, then the new updated resource is sent back in the response.

If the ETag sent by the client is the same as the current ETag of the resource, them the server responds with __304 Not Modified__.

![ETag for caching](/assets/ETag-for-caching.png){:.img-364-770 width="364" height="770"}

This was all conceived in the days of precious bandwidth to prevent resending of resources that haven't changed.

However, ETags can also be used to implement optimistic concurrency.

## Use ETags for Optimistic Concurrency

If you have any [CRUD](http://en.wikipedia.org/wiki/Create,_read,_update_and_delete) screens in your web application, you've probably hit the issue of concurrency: when two users modify the same entity with different changes, then how do you prevent the second user from overwriting the changes committed by the first user?

Since ETags were conceived to identify when resources on a web server change, then we can also use them to validate that the resource on the server hasn't changed before updating them in the data store.

Here's how that would work:

![ETag for concurrency](/assets/ETag-for-concurrency.png){:.img-364-770 width="364" height="770"}

Notice in the above example:

* For concurrency, use the __If-Match__ header instead of the __If-None-Match__ header (we want to update it when the ETag is the same, rather than caching where we want it if the ETag is different)
* When PUT'ting a resource that hasn't changed, then the resource is updated and the server returns 200 (OK)
* When PUT'ting a resource that has changed, then the resource is NOT updated and the server returns 412 (Precondition Failed)

## Implementing ETags

[In my next post]({% post_url 2014-06-05-restangular-and-etags-pt2 %}) I’ll show how you can easily implement optimistic concurrency using Restangular and ETags.
