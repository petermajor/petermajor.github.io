---
layout: post
title: AngularJS animations + Animate.css = easier animations
date: 2014-05-04 22:38:38
categories:
- AngularJS
tags:
- AngularJS
- animations
published: true
author: peter_major
sitemap:
  priority: 0.6
  changefreq: weekly
---
## Scenario

I've been working on a small web page recently (my [online CV](http://cv.petermajor.co.uk)).

There is one section of the page where I use AngularJS. There are multiple checkboxes in this section and a message that changes depending on how many checkboxes are selected.

The markup for the message looks like this:

{% highlight html %}
<ng-switch on="selectedCount">
    <div class="message" ng-switch-when="6">"Call me, call me any, anytime"</div>
    <div class="message" ng-switch-when="5">I'm tracing your IP address to locate your office.</div>
    <div class="message" ng-switch-when="4">You guys are awesome!</div>
    <div class="message" ng-switch-when="3">Sounds good - I'm in!</div>
    <div class="message" ng-switch-when="2">Interesting... tell me more.</div>
    <div class="message" ng-switch-when="1">OK... anything else?</div>
    <div class="message" ng-switch-when="0">&nbsp;</div>
</ng-switch>
{% endhighlight %}

I wanted an animation on text change to focus the user's attention on the message.

AngularJS added native support for animations in version 1.2. I thought, "This should be easy."

<!--more-->

## AngularJS Animations Only

The CSS classes that you write differ depending on the AngularJS directive you are animating. For ngShow / ngHide, you animate "add" and "remove" (the ng-hide class is added or removed from the element). For ngSwitch you animate "enter" and "leave" (an item added or removed from the DOM).

The AngularJS documentation shows an animation sample on directives that can be animated. Here's the documentation for [ngSwitch](https://docs.angularjs.org/api/ng/directive/ngSwitch)

Here's a Plunkr I created of the AngularJS-only animation: [Plunkr](http://plnkr.co/edit/825hZ3rFjj76Hr82dFCT?p=preview)

The animation CSS looks like this:

{% highlight css %}
.message.ng-enter {
  opacity: 0;
  -webkit-transition:all linear 1s;
  -moz-transition:all linear 1s;
  -o-transition:all linear 1s;
  transition: opacity 1s;
}

.message.ng-enter.ng-enter-active {
  opacity: 1.0;
}
{% endhighlight %}

Notice you have to code two classes: __.ng-enter__ and __.ng-enter-active__.

The __.ng-enter__ class is how the item should look at the beginning of the animation - in this case invisible.

The __.ng-enter-active__ class is how the item should look at the end of the animation - in this case fully visible

In between the two states, the opacity will transition from 0 to 1.

It's not hard, but it did take me a few minutes to get it working...

## AngularJS Animations + Animate.css

[Animate.css](http://daneden.github.io/animate.css/) is a library of cool, ready-made css animations. You only need to include a css file, that's it.

So what do you get by using Animate.css that you can't do with just AngularJS? Nothing, is the short answer. The slightly longer anwser is:

* writing the AngularJS css is much easier
* it comes with a built in library of transitions, so you don't have to write the css keyframes yourself

Here's a Plunkr I created of the AngularJS + Animate.css animation: [Plunkr](http://plnkr.co/edit/RXUp9kCp8dz2lzUqSR1j?p=preview)

The animation CSS looks like this:

{% highlight css %}
.message.ng-enter {
    -webkit-animation: fadeIn 1s;
    -moz-animation: fadeIn 1s;
    -ms-animation: fadeIn 1s;
    animation: fadeIn 1s;
}
{% endhighlight %}

Firstly, I can just name a animation by name, I don't have to know what properties I want to animate. The Animate.css library has some pretty complex animations to... I wouldn't want to spend my time writing those!

Secondly, notice that I didn't have to specify the __.ng-enter-active__ class.

This is just simpler - and simpler is always better.

## Summary

The AngularJS team deserve major kudos for adding animations in 1.2. Having built-in support is way better that having to bolt-in another javascript solution.

That being said, it really is just a framework. It doesn't come with any built-in animations and the syntax is a bit esoteric.

Combining that framework with the goodness of Animate.css means that animations in AngurlarJS are accessible to anyone.

I just hope that means that we won't be going back to a 1990 style web, where everything is flashing ;-)
