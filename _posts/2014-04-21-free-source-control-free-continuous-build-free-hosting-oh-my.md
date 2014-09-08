---
layout: post
title: Free source control, free continuous deployment, free hosting - oh my!
date: 2014-04-21 20:32:35
author: peter_major
categories:
- Azure
tags:
- Azure
- Web Development
published: true
---
## Scenario

You want to bang up a quick website and have it available on the web. Maybe its a demo, prototype... whatever.

Shameless plug: In my case I'm searching for a new job and I wanted to post my [CV as a website](http://cv.petermajor.co.uk).

Like any good software engineer, you instantly start thinking about the technology you're going to use rather that the content you're going to write... Just kidding, why aren't you laughing?

* Where are you going to host your site?
* How are you going to build and deploy your site?
* Where are you going to store the source code for the site?

The answer is just three words: _Free, Easy, Azure_.

<!--more-->

## Visual Studio Online

[Visual Studio Online](http://www.visualstudio.com/en-us/products/visual-studio-online-overview-vs.aspx) is the renamed Team Foundation Service. For up to 5 users, you can get the following for free:

* unlimited projects and private code repositories<br /><br />
Yes, you read that correctly - unlimited and private. When I was deciding where to store the source code for my CV, I didn't want to store it on my laptop (I rebuild it frequently). I use a Bootstrap theme in my CV that is not open source, so I couldn't store it on GitHub without paying (GitHub is only free for public repositories). Visual Studio Online was perfect.<br /><br />
* 60 build minutes per month<br /><br />
You can configure Visual Studio Online to build and deploy your project automatically every time you push code to source control. For large commercial projects this is probably not the release strategy you will use. For small projects like my online CV, however, it was perfect. For larger teams, 60 minutes of build time per month isn't that much. My project takes 2 minutes to build and deploy, do I could do that about 30 times / month without being charged.<br /><br />
* end-to-end integration with Visual Studio<br /><br />
This ain't your grand daddy's web hosting. Have you ever hosted your website with an ISP before? Bet you transferred your files via FTP, right? The workflow for changing my CV went like this: make some changes in Visual Studio, click the "Commit" button in the Team Explorer tab, wait 3 minutes, my changes are live on my public-facing website. It's surprising&nbsp;just how joined-up the experience is.

## Azure Websites

So we've got somewhere to put the source code, and something that builds and deploys the site. So how are you going to host it? That's where [Azure Web Sites](http://azure.microsoft.com/en-us/services/web-sites) comes in.

Hosting comes in many tiers - each with different features and pricing. The tiers you are most likely going to want to use for a small website are _free_ or _shared_.

When I was developing my CV website I developed it on the free tier - a perfectly respectable configuration for a small website. When my site went live I wanted to use my personal domain name, however, so upgraded to the shared tier.

And that folks is the real beauty of Azure - elastic changes. In my mind, it's the primary use case for using it. If your hosting requirement is relatively stable, then there are probably cheaper ways to host your site. But when you want to change the configuration over short periods of time (say your website has high peak loads, or it's only temporary) then the gaps where you scale down are your hosting savings.

Let me give you a better example:

I could have hosted my CV with my ISP - a year's worth of hosting from them is £35 / year.

On Azure, I developed my site on the free tier, upgraded it to shared tier for 2 months for ~ £6 / month. When I land my next dream job, I'll move it back down to the free tier. Assuming my job search takes 2 months, that's only cost me £12.

The difference between the two is the cost savings of dynamic scaling.

## How do I do it?

You like the idea of using Visual Studio Online for your next little project? Great, checkout my next post, where I'll take you through setting this up, step by step.

EDIT: Here's the follow-up post [Setting up Visual Studio Online Continuous Deployment]({% post_url 2014-04-27-setting-up-visual-studio-online-continuous-deployment %})

[Google](https://plus.google.com/+PeterMajorUk?rel=author)
