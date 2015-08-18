---
layout: post
title: Using Android Java libraries with Xamarin (pt. 2)
date: 2015-06-16 21:57:00
categories:
- Xamarin
tags:
- Xamarin
- Android
published: true
author: peter_major
comments: true
sitemap:
  priority: 0.6
  changefreq: weekly
---

This is part 2 of a 2 part series: [part 1]({% post_url 2015-06-11-using-android-java-libraries-with-xamarin-pt-1 %})

## Recap

In the previous post, we explored using a small snippet of Java code in a Xmarain application. This code was a .java file embedded as a resource in the .apk.

The [Xamarin sample](http://developer.xamarin.com/samples/monodroid/JniDemo) for this feature defines an activity in Java and then starts the activity with an intent. The problem occurs when you actually want to call any methods on this class from C#. For that, you need to create a _Managed Callable Wrapper_... think of it as an interp definition - like old-skool C# [extern](https://msdn.microsoft.com/en-us/library/e59b22c5.aspx).

These MCW's are not easy to create by hand. You certainly wouldn't want to do it for something large, like an API or an SDK. Fortunately, there is a better way.

## Android Java Bindings Library

An _Android Java Bindings Library_ is a Xamarin library which wraps Java .jar files At build time, it will create MCW's for classes in the .jar. This process can be customized with hints to exclude, rename or other modify the generated classes. The classes in the .jar can then be called by C#.

There are many Android libaries that are packaged as .jar. This effectively lets you use any Android SDK that a native Android developer could use.

Let me give you the scenario for which I created my first binding library. At JUST EAT, we use Amazon AWS. There is a pure [Xamarin C# AWS SDK](https://github.com/awslabs/aws-sdk-xamarin), but it's not got all of the features that exist in the [Android AWS SDK](http://aws.amazon.com/mobile/sdk/).

What ya gonna do? Well, first of all check to see if someone else has created a Xamarin binding library. Nope? Well, create one yourself of course!

## My First Binding Library

Start by opening Xamarin Studio and clicking __File__ > __New__ > __Solution...__

Select __Android Java Bindings Library__:

![Android Java Bindings Library](/assets/1-AndroidBindingLibrary.png){:.img-512-369 width="512" height="369"}

Fill in the project details in the next screen and click __Create__. A new binding project will be created.

The next thing you need to do is drop the .jar(s) you want to use into the __Jars__ folder of the project. In my case I was only interested in using the _Kinesis Recorder_, so I just used the _Core_ and _Kinesis_ jars from the SDK. 

If you want to follow along at home you can download the sample code for this project from [Github](https://github.com/petermajor/).

![Add Jars](/assets/2-AddJarsToProject.png){:.img-512-369 width="355" height="267"}

Right-click on each .jar and be sure that the _Build Action_ is set to _EmbeddedJar_. Xamarin Studio may do this for you when you add a .jar to the project.

The _AboutJars.txt_ in the _Jars_ folder does a good job at explaining the 4 different build actions in relation to jars in a binding library.

Now build the project... __Oh no! 9 errors!__

## Transforms

Errors when first compiling a binding library are very common. Xamarin have writen an introduction to a couple of the most common issues you'd find and how to fix them - [Resolving_API_Differences](http://developer.xamarin.com/guides/android/advanced_topics/java_integration_overview/binding_a_java_library_(.jar)/#Resolving_API_Differences).

Most of the time these errors are due to the subtle language differences that exist between Java and C# -

like xyz

To summarize, the way to fix the errors is to specify _tranforms_ that give the MCW generator hints that help it convert the Java into valid C#.

There are a lot of errors with this particular library, so let's exclude all the classes and gradually work our way towards the class I'm interested in: `KinesisRecorder`.

Find the file __Metadata.xml__ in the __Transforms__ folder. It should have been generated for you, but it will be empty.

Add the following line:
`<remove-node path="/api/package[starts-with(@name, 'com.amazonaws')]" />`

Now compile the project. It compiled! Let's take a look at what it generated.

You can see the MCW classes it's generating by navigating to __./obj/Debug/Generated/src__. Navigate to that folder and you will see that it's empty. 

The line of xml that we added to the __Metadata.xml__ file was a command to exclude all nodes where the package name starts with __com.amazonaws__. The nodes that it's referring to are the entries in the __./obj/Debug/api.xml__. That file contains an export (in an xml hierarchy) of all the classes and interfaces in the embedded .jar files.

We explicitly told it to remove _all_ nodes that started with the package name 'com.amazonaws' - pretty much everything.



