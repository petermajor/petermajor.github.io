---
layout: post
title: Setting up Visual Studio Online Continuous Deployment
date: 2014-04-27 21:13:41
author: peter_major
categories:
- Azure
tags:
- Azure
- Web Development
published: true
---

This is a followup post to [Free source control, free continuous deployment, free hosting - oh my!]({% post_url 2014-04-21-free-source-control-free-continuous-build-free-hosting-oh-my %})

In this post I'm going to step you through Setting up Visual Studio Online Continuous Deployment.

Here's how we're going to accomplish that:

1. Create a Visual Studio Online account
2. Create a new project in that account
3. Connect Visual Studio to the project
4. Create a new web application
5. Create an Azure web site
6. Link Visual Studio Online to the web site
7. Commit changes to your web site

Ready to go? Then grab your keyboard...

<!--more-->

## Prerequisites

* You should have Visual Studio installed on your development machine. I'll be using Visual Studio 2013 Professional Update 1. The screenshots may look different and features may work differently if you're using another version. This functionality may or may not exist in the "Express" editions of Visual Studio.
* You should have an Microsoft Azure account. You can [sign up](http://azure.microsoft.com/en-us/pricing/free-trial/) here, which gives you an incredibly generous £130 credit in the first month to experiment with many things. It's unfortunate that you do have to provide a credit card when you sign up. Azure is a PAYG service, so you'll only be billed for what you use, not a subscription fee.

## Create a Visual Studio Online account

First, we need to create a Visual Studio Online account which will host the source control.

* Login to the Azure management console at [https://manage.windowsazure.com](https://manage.windowsazure.com).
* The menu along the left show all the Azure components. Find __Visual Studio Online__ about half way down and select it.
* Click on the __Create or link to a visual studio online account__ button:<br />
[![Create Visual Studio Online Account (step 1)](assets/1-CreateVisualStudioOnline.png){:.img-300-149 width="300" height="149"}](assets/1-CreateVisualStudioOnline.png)
* Select __Quick Create__ and type name in the URL text box. The name needs to be unique over Azure and a green tick will appear if this is true.  Remember this name, we'll need it later<br />
[![Create Visual Studio Online Account (step 2)](assets/2-ChooseAccountName.png){:.img-300-135 width="300" height="135"}](assets/2-ChooseAccountName.png)
* Wait for Azure to provision the account. When it is done, click the __Browse__ button, on the footer of the console. This will take you to the Visual Studio Online portal.

## Create a new project in that account

In the previous step, we've created a VSO account. By default the account is a basic plan (i.e. free). You can find a list of the plans and features [here](http://www.visualstudio.com/en-us/products/visual-studio-online-overview-vs.aspx).

If you've followed the tutorial, the screen will look like this:<br />
[![Create New VSO Project](assets/3-CreateNewProject.png){:.img-300-235 width="300" height="235"}](assets/3-CreateNewProject.png)

Now we're going to create our first project:

* Supply a project name - try __MyNewApplication__.
* Select a version control system. I prefer __Git__ and will be using it in this post. If you choose TFVC then the screenshots won't match what you're seeing
* Project template is more advanced features like how you track the work you do. We won't be discussing that in this post. I selected __MSF for Agile Software Development 2013.2__.
* Click __Create project__ to provision the project.

Now we've got a Visual Studio Online account, which has a single project. Now we're ready to connect this project to your installation of Visual Studio.

## Connect Visual Studio to the project

So we've created a new VSO project. Now we need to connect Visual Studio to that project. Luckily, there's a button for that!

[![Connect Visual Studio to VSO online](assets/4-ConnectToVisualStudio.png){:.img-300-168 width="300" height="168"}](assets/4-ConnectToVisualStudio.png)

* Click on __Open with Visual Studio to connect__ button.
* This will start Visual Studio. You must now login to Visual Studio Online. Use your Azure credentials:
* After logging it, it should hopefully be showing the __Team Explorer__ tab. If not, you can open this tab via the top menu: VIEW > Team Explorer. In my screenshot, the tab is on the left side of Visual Studio, on your screen it may be on the right:<br />
[![Clone the Visual Studio repository](assets/5-CloneRepository.png){:.img-300-235 width="278" height="300"}](assets/5-CloneRepository.png)
* Click the __Clone this repository__ link in the Team Explorer
* For the clone location, except the default locations by clicking the __Clone__ button. However, make a note of the folder where it's putting the repository:<br />
[![Clone the Visual Studio repository (step 2)](assets/6-CloneSettings.png){:.img-278-300 width="278" height="300"}](assets/6-CloneSettings.png)

Now the empty VSO project is "cloned" to our disk and Visual Studio knows about it. Let's add some code.

## Create a new web application

In the last step we connected Visual Studio to the VSO project (technically, we cloned the Git repository). Now we're going to create a new web application:

* From the menu along the top, click __File &gt; New Project__
* Find the __Web__ templates, and select __ASP.NET Web Application__. Don't worry if you don't have the "Nancy" templates, I have other stuff installed:<br />
[![Add a new web application](assets/7-NewProject.png){:.img-300-208 width="300" height="208"}](assets/7-NewProject.png)
* It is very important that the __Location__ text box has the folder name where we cloned the repository. Remember I asked you to make a note of it? If you put it in a different location Visual Studio will lose the connection to Visual Studio Online.
* Click __OK__. You'll be asked what kind of web application you would like to create. Select __MVC__. Make sure everything else is unchecked:<br />
[![Create an MVC application](assets/8-NewMvcApplication.png){:.img-300-223 width="300" height="223"}](assets/8-NewMvcApplication.png)
* Click __OK__. This will create the new web site. We can now run the web application just to make sure it works. On the menu along the top of Visual Studio, select __DEBUG &gt; Start Debugging__. A browser window with your web site should appear:<br />
[![Your new awesome MVC application](assets/9-NewWebApplication.png){:.img-300-283 width="300" height="283"}](assets/9-NewWebApplication.png)
* Stop the debugger by going back to Visual Studio and selecting __DEBUG &gt; Stop Debugging__ from the top menu.

So we've created the first version of our awesome new web site. Now we need somewhere to host it on the internet... I wonder where might be a good place for that?

## Create an Azure web site

When people come to our web site, they'll actually be running a web site located on a virtual machine in a Microsoft data center. We're going to move over to the Azure management console and configure this web site.

* Go back to the Azure management where we created our VSO account. From the menu along the left, find __Web Sites__.
* Click on the __Create a new web site__ button:<br />
[![Create New Website](assets/10-CreateNewWebsite.png){:.img-300-107 width="300" height="107"}](assets/10-CreateNewWebsite.png)
* Select __Quick Create__ and type name in the url text box. The name needs to be unique over Azure and a green tick will appear if this is true:<br />
[![Choose web site name](assets/11-ChooseWebsiteName.png){:.img-300-92 width="300" height="92"}](assets/11-ChooseWebsiteName.png)
* Wait for Azure to provision the web site.

What have we actually created here? We've created an empty web site container. At the moment the web site has no content and if you navigate to the URL you will see a holding page.

## Link Visual Studio Online to the web site

Now that we have created our web site container, we going to configure the continuous deployment feature. This is the special sauce that will deploy your web site every time that you commit a change to source control.

Coming from the last section, your screen should look like this:

[![The web site has been created](assets/12-WebSiteCreated.png){:.img-300-84 width="300" height="84"}](assets/12-WebSiteCreated.png)

* Click on the __arrow__ that's beside the web site name. This will show you lots of configuration options as well as diagnostics for your site
* Click on the __Dashboard__ tab at the top. This is a summary of your web site
* There's a sneaky little link called __Set up deployment from source control__ under the __quick glance__ section on the right. Click it!
* A dialog will pop up asking where your code is. Select __Visual Studio Online__ and click __Next:__<br />
[![Where Is Your Code](assets/13-WhereIsYourCode.png){:.img-300-84 width="300" height="207"}](assets/13-WhereIsYourCode.png)
* In the next screen, type in the name of the Visual Studio Online account from step 1, then click __Authorize Now.__
* In the next screen, it will ask you to select the repository (project) name. This is the name that we provided in step 2 - __MyNewApplication__.
* Click __Complete__. It will take a few moments to link the project to the web site.
* When the linking is complete, you will be moved to a new tab in the web site details - __Deployments__. This will show you each automatic deployment that has been made when you commit code.

Now we linked Visual Studio Online to our web site. There's only one more thing to do. Let's make our first code commit!

## Commit changes to your web site

We've created a new solution in Visual Studio and ran the web site locally to check that it worked. But we haven't committed that web site to Visual Studio Online yet. When we do, it will automatically build and deploy the code to the web site container. We'll then be able to navigate to the web site!

* In Visual Studio, select the __Team Explorer__ tab.
* Click on the __Changes__ button near the top. This will show you all the changes you have made since your last commit:<br />
[![Commit Your Changes](assets/14-CommitYourChanges.png){:.img-281-300 width="281" height="300"}](assets/14-CommitYourChanges.png)
* Notice that the __Commit__ button is disabled. We need to provide a description of the changes in the text box above the button before we can commit. Type some like __Start of a new era__ as the commit message.
* Now click on the __down arrow__ beside the commit button and click on __Commit and Sync__. This will send the code to Visual Studio Online.
* Head back to the Visual Studio online browser window where we created our project. If you closed the window, go to: __https://&lt;your-account-name&gt;.visualstudio.com/__ and navigate to your project.
* Click on the __BUILD__ menu at the top, you should see that your commit has triggered a build:<br />
[![Build Queued](assets/15-BuildQueued.png){:.img-300-98 width="300" height="98"}](assets/15-BuildQueued.png)
* Double click on the item in the queue and you'll get a detailed log:<br />
[![Build Log](assets/16-BuildLog.png){:.img-300-151 width="300" height="151"}](assets/16-BuildLog.png)
* The build will take a few minutes to complete. The bigger the project, the longer it will take.
* Now flip back to the Azure management console. When we left it, you were on the __Deployments__ tab for the web site. If you refresh the tab you should see that a new deployment has appeared:<br />
[![New deployment is active](assets/17-Deployments.png){:.img-300-92 width="300" height="92"}](assets/17-Deployments.png)
* And now, the moment of truth. If I navigate to the Azure web site address in your favorite browser, you will be greeted with your new web application:<br />
[![My New Application](assets/18-MyNewApplication.png){:.img-300-275 width="300" height="275"}](assets/18-MyNewApplication.png)
* SWEEEET!

## Wrap up

You're probably thinking, "There's no way I'm gonna remember that. You said in the last post that this would be _easy_." And you'd be right, except let's look at how often you'll actually do this stuff:

* You'll only do step 1 once in your life. Congratulations, you will never do that step again.
* You'll do 2 through 6 once, for each new project... still not that often.
* You'll do step 7 a lot. That's the step where you click the __Commit__ button. That's all you have to do. Over and over...

Good luck and happy __Commit__ button mashing!

[Google](https://plus.google.com/+PeterMajorUk?rel=author)
