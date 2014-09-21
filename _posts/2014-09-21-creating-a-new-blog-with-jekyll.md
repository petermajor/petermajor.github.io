---
layout: post
title: Creating A New Blog With Jekyll
date: 2014-09-21 13:17:00
categories:
- Jekyll
tags:
- Jekyll
published: true
author: peter_major
comments: true
sitemap:
  priority: 0.6
  changefreq: weekly
---

This is part 2 of a n part series: [part 1]({% post_url 2014-09-16-converting-a-wordpress-blog-to-jekyll-pt1 %})

## Running Jekyll Locally

In the last post I went through some of the reasons why I wanted to convert my blog to Jekyll and GitHub Pages.

I mentioned that you will setup your blog scaffolding once. Then for each post you'll write simple markdown files. GitHub will convert these markdown files to HTML.

The thing is, it's nice to know how you're site is going to look _before_ you commit your post to GitHub.

When working on posts it's not really necessary. When working on the original scaffolding of your blog though, you're best to test the changes locally before committing to GitHub. You don't want to trash your site, do you?

So you should install the Jekyll environment - and you should install it in exactly the same way that GitHub Pages does.

GitHub has published a [step-by-step guide](https://help.github.com/articles/using-jekyll-with-pages) on how to setup your environment.

<!--more-->

## Installing GitHub Pages on Windows

If only it was as easy as it sounds in the installation guide.

I followed the instructions above on my Windows laptop. I got to the end, created a new site and ran __jekyll serve__ command and... error!

A little bit of Googling led me to the [official Jekyll documentation](http://jekyllrb.com/docs/installation), where I was surprised to read that Jekyll isn't officially supported on Windows, just Mac and Linux.  

More Googling led to some articles describing work arounds for my issue, but I wasn't keen. Learning a new frameowrk is challenging enough without fumbling around on an unsupported operating system.

## Installing GitHub Pages on a Mac

Luckily my employer had just provided me with a shiney new Mac Book Pro. Thank you JUST EAT!

Ruby is already installed on Macs, so that is one less item I needed to install.

Off I went, following the [installation guide](https://help.github.com/articles/using-jekyll-with-pages) again. I was feeling very smug knowing that this would all be a breeze on my Mac.

__Wrong!__

While installing the GitHub Pages gem I got some cryptic error regarding installing __Nokogiri__.

Googling that error led me the [Nokogiri installation guide](http://nokogiri.org/tutorials/installing_nokogiri.html), which claims that _installing Nokogiri is hard_ is a "little myth".

Whoever wrote had a good sense of humor!

I did _eventually_ get Nokogiri and GitHub Pages working, but I can't say it was a pleasant experience.

## Installing GitHub Pages on Linux

I already had a Ubuntu virtual machine set up on my Windows laptop, so I decided to also install GitHub pages on the Linux environement too.

For the third time I went through the [installation guide](https://help.github.com/articles/using-jekyll-with-pages).

Installing Ruby was the hardest part of the installation. I did not encounter any errors installing the components on Linux - this was definitely the easiest installation of the three operating systems.

## Creating Your First Blog

Jekyll has a command that will setup the scaffolding for a new blog. Don't set your expectations too high - it creates the bare minimun needed for your blog to exist. It's not pretty, it's just functional.

In a command window type: <code>jekyll new my-first-blog</code>

Then change to the folder __my-first-blog__ and type: <code>jekyll serve</code>

This will use a templating engine to convert markdown files into HTML and then start a local web server to host your site.

Finally, in the browser navigate to __http://localhost:4000__ to view the blog.

## Wrap Up

I have to admit that my Jekyll / GitHub Pages installation experience wasn't good. I'm a software engineer and I have a high level of confience when it comes to troubleshooting problems. I'm sure a less technical person would have given up.

In fact, I almost gave up with Jekyll and GitHub Pages at one point, but I was convinced that I wanted to migrate my Wordpress blog to a static blog. I just couldn't find any mainstream alternative to Jekyll.

Luckily, this is absolutely the worst part of the journey. The road is a lot less bumpy after this.

In my next post, I'll describe how I setup the scaffoling for the site. Also I'll demonstrate how I exported my posts from my existing Wordpress site into Jekyll.

