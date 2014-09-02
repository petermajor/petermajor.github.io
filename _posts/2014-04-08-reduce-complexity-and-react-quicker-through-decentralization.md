---
layout: post
title: Reduce complexity and react quicker through decentralization
date: 2014-04-08 19:41:53.000000000 +01:00
categories:
- Other passions
tags:
- decentralization
- TeamCity
status: publish
type: post
published: true
meta:
  _wpas_done_all: '1'
  _hm_tor_status: published
  _edit_last: '2'
  _yoast_wpseo_focuskw: reduce complexity
  _yoast_wpseo_title: Reduce complexity and react quicker through decentralization
  _yoast_wpseo_metadesc: In this post I'll be discussing why you should reduce complexity
    to enable software development teams to react quicker, albeit at a slightly higher
    cost.
  _yoast_wpseo_linkdex: '81'
author:
  login: peter.major
  email: peter@petermajor.co.uk
  display_name: Peter Major
  first_name: Peter
  last_name: Major
---
I've been reading a book by _Charles Hugh Smith_ called _Get a Job, Build a Real Career, and Defy a Bewildering Economy_ \([amazon.co.uk](http://www.amazon.co.uk/Build-Real-Career-Bewildering-Economy-ebook/dp/B00JJX2KZM/ref=tmm_kin_title_0?ie=UTF8&amp;qid=1399318599&amp;sr=8-1)\).

The main premise of the book is that to get (and keep) a high-paying job, you need to stay ahead of labor commoditization. I won't go into that in any more detail here. However, one of the secondary threads running through the book is the theme of decentralization.

I found this particularly interesting due to an experience I had recently at work a few months back.

## Complexity

All of the projects for our engineering department are built on an automated build system \([TeamCity](http://www.jetbrains.com/teamcity/)\). The system has multiple "agents" that allow it to build more than one product simultaneously. Most of the agents are the same (they're virtual machines restored from a snapshot) and most can build any project.

The projects are quite varied in the languages and technologies used. From time to time, a dependency for a project changes (a new version of a framework that adds a feature, for example) and that sometimes means a change to the agent. Very infrequently, a developer from the respective project would change this dependency and end up breaking the build system for the rest of the projects. An unusual but annoying occurrence.

The breakage didn't happen for a while, and then it did. Enough was enough, the organization decided that it shouldn't happen again, so what was to be done?

It's my experience that when faced with a challenge of complexity, an organization handles the issue in one of two ways:

1. Manage complexity by assigning a manager and removing responsibility from other actors (centralization)
2. Reduce complexity by untangling the system and separating the actors (decentralization).

## Centralization

In this particular build system example, the suggestions to manage the complexity were:

* lock down the agents so that developers wouldn't have access to them
* dev ops would manage the agents so that they know what's on the box and when to make the changes
* have as little deviation as possible between the projects in regards to dependencies (i.e. everyone should use the same framework and the same version)

Cons:

* Developers couldn't make the changes - they'd request changes in a ticketing system. This would be slower than if the develops just made the changes themselves.
* Developers would lose ownership of the agents - if something goes wrong or they don't know how it works - it's dev ops' problem.
* Projects couldn't change dependencies without seeking consensus from other projects and upgrading simultaneously.

## Decentralization

The suggestions to reduce the complexity were:

* give each project their own dedicated agents
* projects would manage and own their agents
* projects would chose their dependencies and change them as needed

Cons:

* Each TeamCity agent has to be licensed. If each team has dedicated agents then more agents would be needed then if agents were pooled.

We decided to try the decentralized model on my project - the other teams would have their build agents managed for them.

## Agility

Fast-forward a couple of months and the build systems related to Azure projects started behaving erratically. To cut long story short, builds started failing because we were using an old version of the Azure SDK.

Members on my project diagnosed the issue. Because we had our own build agents, we changed our code to use the new SDK and upgraded the SDK on the build agents in less than a day. We ran builds continuously over the next couple of days to prove that this solved the issue.

We were able to react quickly because we did not worry about impacting another projects. We were _fearless_.

The other teams were using a pool of build agents. The teams could not reach a consensus about when a was good time to upgrade the SDK - some projects wanted to prioritize the upgrade ASAP, while for other prjects it just wasn't a priority. At the time of writing this post, the SDK _still_ has not been upgraded on the pooled agents! 

## Summary

I think, as developers, we already understand that reducing complexity is a good thing.

When you think about [loose coupling and high cohesion](http://msdn.microsoft.com/en-us/magazine/cc947917.aspx) of components, that's really what we're talking about. In the same way that designing code so that it is loosely coupled may have a slightly higher upfront cost, we know that the overall cost of maintaining that code is lower.

We also know that the reason we write tests is so that we are fearless. When we refactor a system, we must know that we haven't changed the behavior of that system. If we're fearful, we don't change the system. It rots and dies.

I think the same paradigms can be applied to not just the code we write, but the way we work too.

[Google](https://plus.google.com/+PeterMajorUk?rel=author)

