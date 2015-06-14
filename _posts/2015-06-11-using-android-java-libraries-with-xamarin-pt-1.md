---
layout: post
title: Using Android Java libraries with Xamarin (pt. 1)
date: 2015-06-14 14:46:00
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

This is part 1 of a 2 part series: part 2

In this part, I will show you a cool feature of Xamarin.Android that you probably don't know about: the ability to embed .java files directly in your C# project and then execute that Java code.

## Java? Why? 

Have you ever Google'd for how to do something in Android and found some Java code?

What are the options for using that Java code in your Xamarin app?

If it's a large library, like an SDK, then you'll want to get the .jar and create an _Android Binding Library_. That's the topic of Part 2 in this series and we won't talk about that further today.

If it's a small bit of code, then your options are:
1. Convert the Java code to C# manually,
2. Include the Java code in your app and call it (the topic of this post)

## Samples

I first learned about this feature by stumbling across a [Xamarin sample](http://developer.xamarin.com/samples/monodroid/JniDemo).

If you're not familiar with the Xamarin samples library, I recommend that you have a look through http://developer.xamarin.com/samples.

Xamarin have a comprehensive library of samples for all areas of the platform. They're really good at keeping them up to date as new versions of Xamarin are released.

It's a great way to discover features that might come in handy one day.

<!--more-->

## Adding a .java class

Let's create a new Xamarin.Android project. I'll be using latest version of Xamarin Studio on a Mac.

![Create a new Android project](/assets/1-NewAndroidProject.png){:.img-512-369 width="512" height="369"}

![Android project properties](/assets/2-AndroidProjectProperties.png){:.img-512-372 width="512" height="372"}

After creating the project, add a new .java file to the root of the Android project.

Here's a simple .java class that we can use: [download](https://github.com/petermajor/CallMyJava/blob/master/ClickCounter.java)

{% highlight java %}
package com.companyname.callmyjava;

public class ClickCounter {

  int count = 0;

  public int Clicked()
  {
    return ++count;
  }
}
{% endhighlight %}

Your project should look like this:

![This is your project on Java!](/assets/3-ProjectWithJavaFile.png){:.img-512-211 width="512" height="211"}

Next, we need to tell Xamarin Studio to treat that file as an Java source file and so that it will be compiled it into the application:

Right-click on the .java file, select __Build Action__ > __Android Java Source__.

Finally, let's instantiate an instance of that class, just to make sure it actually is in the app.

Add this to the onCreate code of your MainActivity, just before the button.Click assignment:

{% highlight csharp %}
var counter = Java.Lang.Class.ForName ("com.companyname.callmyjava.ClickCounter").NewInstance();
{% endhighlight %}

Let's set a breakpoint on the `button.Click` assignment and inspect the value of _counter_:

![Java object watch](/assets/4-JavaObjectWatch.png){:.img-512-109 width="512" height="109"}

You can see that we've instantiated the class and have an instance - cool!

## Call a method

Let's call `ClickCounter.Clicked()` in the `button.Clicked` event:

{% highlight csharp %}
    button.Click += delegate {

    var count = counter.Clicked();
    button.Text = string.Format ("{0} clicks!", count);

  };
{% endhighlight %}

Compile.

__It doesn't compile!__ Why?

## Managed Callable Wrapper ##

The problem is that the C# code doesn't know what methods are on the class. It only knows it as a `Java.Lang.Object`.

We could cast the object so that the compiler knows what methods are on the object... but what would we cast it as?

The answer is that we need to create a _Managed Callable Wrapper_ for the Java class. This is a C# declaration that tells Xamarin.Android how to marshal calls to the java class.


Here's Xamarin documentation that explains [managed callable wrapper](http://developer.xamarin.com/guides/android/advanced_topics/java_integration_overview/working_with_jni/) in more detail.

If you're like me you read that documentation and went "WTH?". 

Writing a MCW by hand can be quite difficult. In part 2 of this series where we use .jar libraries, I'll show you how to generate the wrappers automagically.

For this exercise, I've generated an MCW for you: [download](https://github.com/petermajor/CallMyJava/blob/master/ClickCounter.cs)

{% highlight csharp %}
using Android.Runtime;

namespace CallMyJava {

  [global::Android.Runtime.Register (
    "com/companyname/callmyjava/ClickCounter",
    DoNotGenerateAcw=true)]
  public partial class ClickCounter : global::Java.Lang.Object {

    internal static IntPtr java_class_handle;
    internal static IntPtr class_ref {
      get {
        return JNIEnv.FindClass ("com/companyname/callmyjava/ClickCounter", ref java_class_handle);
      }
    }

    protected override IntPtr ThresholdClass {
      get { return class_ref; }
    }

    protected override global::System.Type ThresholdType {
      get { return typeof (ClickCounter); }
    }

    protected ClickCounter (IntPtr javaReference, JniHandleOwnership transfer)
      : base (javaReference, transfer) {}

    static IntPtr id_ctor;

    [Register (".ctor", "()V", "")]
    public unsafe ClickCounter ()
      : base (IntPtr.Zero, JniHandleOwnership.DoNotTransfer)
    {
      if (Handle != IntPtr.Zero)
        return;

      try {
        if (GetType () != typeof (ClickCounter)) {
          SetHandle (
            global::Android.Runtime.JNIEnv.StartCreateInstance (GetType (), "()V"),
            JniHandleOwnership.TransferLocalRef);
          global::Android.Runtime.JNIEnv.FinishCreateInstance (Handle, "()V");
          return;
        }

        if (id_ctor == IntPtr.Zero)
          id_ctor = JNIEnv.GetMethodID (class_ref, "<init>", "()V");
        SetHandle (
          global::Android.Runtime.JNIEnv.StartCreateInstance (class_ref, id_ctor),
          JniHandleOwnership.TransferLocalRef);
        JNIEnv.FinishCreateInstance (Handle, class_ref, id_ctor);
      } finally {
      }
    }

    static Delegate cb_Clicked;
    #pragma warning disable 0169
    static Delegate GetClickedHandler ()
    {
      if (cb_Clicked == null)
        cb_Clicked = JNINativeWrapper.CreateDelegate ((Func<IntPtr, IntPtr, int>) n_Clicked);
      return cb_Clicked;
    }

    static int n_Clicked (IntPtr jnienv, IntPtr native__this)
    {
      global::CallMyJava.ClickCounter __this
        = global::Java.Lang.Object.GetObject<global::CallMyJava.ClickCounter> (jnienv, native__this, JniHandleOwnership.DoNotTransfer);
      return __this.Clicked ();
    }
    #pragma warning restore 0169

    static IntPtr id_Clicked;

    [Register ("Clicked", "()I", "GetClickedHandler")]
    public virtual unsafe int Clicked ()
    {
      if (id_Clicked == IntPtr.Zero)
        id_Clicked = JNIEnv.GetMethodID (class_ref, "Clicked", "()I");
      try {

        if (GetType () == ThresholdType)
          return JNIEnv.CallIntMethod  (Handle, id_Clicked);
        else
          return JNIEnv.CallNonvirtualIntMethod  (Handle, ThresholdClass, JNIEnv.GetMethodID (ThresholdClass, "Clicked", "()I"));
      } finally {
      }
    }

  }
}
{% endhighlight %}

Let's modify our code a bit:
{% highlight csharp %}
var counter = new ClickCounter ();

button.Click += delegate {

  var count = counter.Clicked();
  button.Text = string.Format ("{0} clicks!", count);
};
{% endhighlight %}

Compile.

__It compiles!__ Congratulations, you've just learned how Xamarin.Android works.

The `MainActivity` class you have in your app? That derives from `Activity`, which is a MCW for the Android java `android.app.Activity` class. 

The `Button` instance that we added the click event to? That is a MCW for the Android java `android.widget.Button` class.

Don't believe me? In your `MainActivity` class, find this line of code: `Button button = FindViewById<Button> (Resource.Id.myButton);`

Right-click on `Button` and select __Go to Declaration__.

You'll be shown the decompiled code for C# `Button`. There's not much there, is there. That's because all the code does is define an MCW over the java `Button` implementation.

Almost all of the Xamarin.Android classes are MCW's for their Android equivalents.

## Wrap up

If you run the app and click the button, you will see that the button text changes on each click. The code that counts the clicks is encapsulated in the Java class we embedded into the application.

Generating an MCW by hand is not easy or fun. Realistically, it would have been easier to just convert this code to pure C#.

However, there are times when converting code to C# isn't feasible. If the library is large, converting it to C# would be time-consuming and error prone. For that, you'll want to generate MCW's for the Java classes.

Fortunately Xamarin.Android comes with a utility to generate these MCW's from .jar files. That will be subject for Part 2 of this post.


