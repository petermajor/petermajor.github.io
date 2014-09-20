---
layout: post
title: Using Protractor mocks for AngurlarJS tests without backend (pt. 1)
date: 2014-05-25 12:45:04
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

This is part 1 of a 3 part series: [part 2]({% post_url 2014-05-25-using-protractor-mocks-pt-2 %}), [part 3]({% post_url 2014-07-07-using-protractor-mocks-pt-3 %})

Protractor is now the recommended tool to test AngularJS applications in end-to-end scenarios.

If you go to the documentation for an AngularJS directive and you scroll down to the examples section, you will see a file called __protractor.js__ showing you how to test the directive with Protractor. Here's an example for [ngRepeat](https://docs.angularjs.org/api/ng/directive/ngRepeat#example).

You might say, "I can write unit tests in Jasmine that test my controllers, services, directives. Why do I want to write Protractor tests?"

<!--more-->

Well, TDD has once again become a hot topic of discussion in the development community. There was a great session at NDC called [TDD, where did it all go wrong?](http://vimeo.com/68375232) and more recently Martin Fowler and Kent Beck took back on a multi-part discussion called [Is TDD dead?](https://plus.google.com/events/ci2g23mk0lh9too9bgbp3rbut0k).

I don't think that any of these discussions are really doubting the value of good tests. What they are attempting to highlight is that unit testing every single class in a system can make that system brittle and hard to change. This can be described as _testing implementation rather than testing behavior_.

To put this another way, I don't really care how all my collaborators behave independently, I really just care that when I click that button, this exact data is sent to that server.

Enter Protractor. I would argue that a suite of tests that exercise the way that a user would interact with the application is much more valuable than a set of unit tests that test all of the collaborating classes. The only problem is that I want to run these tests on the commit cycle of my automated build, so they need to be fast and disconnected (not connected to a real back-end).

The good news is that this is incredibly easy to achieve with an AngularJS application and Protractor. Protractor has an amazing feature that allows you to inject scripts into the browser running the application. So to test your AngularJS application with no back-end, all you have to do is inject in a script that mocks out the back-end interaction.

In my [next post]({% post_url 2014-05-25-using-protractor-mocks-pt-2 %}), I'm going to show you how I've achieved that!
