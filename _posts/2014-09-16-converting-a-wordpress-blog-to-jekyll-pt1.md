---
layout: post
title: Converting A Wordpress Blog To Jekyll (pt. 1)
date: 2014-09-16 09:00:00
categories:
- Jekyll
tags:
- Wordpress
- Jekyll
published: true
author: peter_major
sitemap:
  priority: 0.6
  changefreq: weekly
---
## What's wrong with Wordpress?

I know a work colleague who is a PHP developer and I've learned a very important lesson while having beers after work: _don't mention Wordpress_.

I'm a lot more forgiving. I started my first blog [www.levelupcoder.com](http://www.levelupcoder.com) on Wordpress because it was easy. There are lots of competitively priced hosting options that provide pre-configured environments with PHP, MySql and other components required to run a WordPress site.

Additionally, it's incredibly easy to add functionality through plugins. For example, _levelupcoder_ we had 8 plugins installed that added nice features things like automatic backup, social media sharing buttons, Google Analytics, automatical image optimization etc.

So when my PHP friend mentioned that he hosts a blog on [GitHub Pages](https://pages.github.com/) with [Jekyll](http://jekyllrb.com/), I was wondering what that was all about.

In reality, my Wordpress paradise was already starting to crumble:

* We chose a cheap hosting package, which meant our site was under spec'ed to be running all the components required by Wordpress
* Some plugins were restricted by the host for security and performance reasons
* Plugins are so easy and there are some many of them, but ultimately they all have a performance cost that is no immediately obvious to _noobs_
* Running the blog through [PageSpeed](https://developers.google.com/speed/pagespeed/) drowned me in errors - mostly caused by plugins and Wordpress themes.

Google Webmaster Tools was reporting an average page download time time on 1.5 seconds, occassionally peaking at 5 seconds!

This blog had less than 20 posts and was already having performance problems.

<!--more-->

## What's the alternative?

All blogs need a web server. And they all need a database to store content. And they all need to put the content together on the fly before showing it to the user, even though the content rarely changes... Right?

Actually no. Think about the original web. It was simple pages of static content, traversed by hyperlinks, hosted on web servers.

This type of content is extremely fast to present to a user because it doesn't have to be computed on the fly. Static pages can be stored and served from [CDNs](http://en.wikipedia.org/wiki/Content_delivery_network).

This could be your blog!

## Jekyll

You're probably thinking that you like the idea in principle, but you don't want to hack lots of HTML evey time you write a post. That's where Jekyll comes in.

With Jekyll you build the scaffolding of your blog once... you can use a nice Bootstrap theme and all that.

Then each individual post is written in small _markdown_ files. A markdown file is essentially a text file with a few special symbols for bold, italics, bullets etc.

Each time you _make a change_ to the site, it is converted into static html pages that can be hosted as a website.

Compare that to the typical Wordpress installation where the page is coverted _on every view_.

# GitHub and GitHub Pages

Even if you're convinced about static pages, what about issues like hosting and backup.

That's where GitHub comes into play. You can store your blog on GitHub and you have instant backup, resilience and change history that comes with using GitHub. No plugins needed!

And the coolest feature of all... if you store your plain text markdown files in GitHub then GitHub will automatically generate your website using Jekyll __AND__ host the website on GitHub Pages.

The whole setup is extremely swish. About two seconds after sending a new post to GitHub, my post appears on my blog.

## How technical do I have to be?

I'll be honest here... Is this something I could teach my mum to do in a weekend? Probably not.

Is this something a computer programmer could set up in a couple of days. Absolutely!

The hardest bit about the whole affair is the initial setup of the scaffolding / theme - the default Jekyll theme is very minimalistic.

After that, publishing a post is writing a markdown text file and pushing it to GitHub.

## Wrap Up

If you'd like a fast, responsive blog that's very low maintenance and free to host, then I'd say give Jekyll and GitHub Pages a try.

On the other hand, if you're more into lots of plugins and want a blog with all the bells and whistles, then it's probably not for you.

Keep in mind that if you want your blog to run reasonably well, you're going to have to pay for good hosting.

In my next post, I'll step you through how I converted my blog from Wordpress to Jekyll, describing the good, the bad and the ugly.


 

