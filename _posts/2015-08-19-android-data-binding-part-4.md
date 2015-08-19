---
layout: post
title: Android Data Binding (pt. 4)
date: 2015-08-19 22:00:00
categories:
- Android
tags:
- Android
- data binding
published: true
author: peter_major
comments: true
sitemap:
  priority: 0.6
  changefreq: weekly
---

This is part 4 of a 4 part series: [part 1]({% post_url 2015-07-29-android-data-binding-part-1 %}), [part 2]({% post_url 2015-07-31-android-data-binding-part-2 %}), [part 3]({% post_url 2015-08-11-android-data-binding-part-3 %})

In the last post we examined some of the internals of the Android Data Binding Library.

In particular, we discovered that the current implementation of data binding is "one-way". That is to say that if we bind a string value in a view model to an `EditText`, a change in the `EditText` value does not propagate back to the view model.

This might be unexpected for developers who have used data binding in other frameworks, like WPF or AngularJS. These frameworks support "two-way" binding out of the box.

So we'll need to implement our own `EditText` watcher to propagate changes from the view to the view model. What might that look like?

## Watching the EditText

The easiest way to watch the `EditText` is to implement a watcher.

Let's create a __SimpleTextWatcher__ that only requires only one method to be overridden:

<!--more-->

{% highlight java %}
public abstract class SimpleTextWatcher implements TextWatcher {

    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {
    }

    @Override
    public void beforeTextChanged(CharSequence s, int start, int count, int after) {
    }

    @Override
    public void afterTextChanged(Editable s) {
        onTextChanged(s.toString());
    }

    public abstract void onTextChanged(String newValue);
}
{% endhighlight %}

Next, in the view model we can create a method that exposes the watcher. The watcher will be configured to pass the changed value of the control to the view model:

{% highlight java %}
@Bindable
public TextWatcher getOnUsernameChanged() {

    return new SimpleTextWatcher() {
        @Override
        public void onTextChanged(String newValue) {
            setUsername(newValue);
        }
    };
}
{% endhighlight %}

Finally, in the view we can bind the watcher to the `EditText` using _addTextChangeListener_:

{% highlight xml %}
<!-- most attributes removed -->
<EditText
    android:id="@+id/input_username"
    android:addTextChangedListener="@{viewModel.onUsernameChanged}"/>
{% endhighlight %}

As discussed in detail in [part 2]({% post_url 2015-07-31-android-data-binding-part-2 %}) of the series, it's not ideal to expose view paradigms in the view model (in this case a `TextWatcher`). Doing so leaks view implementation into the view model.

## Problem with the watcher

There is a problem with the current implementation. 

If I start the application on my device and type a value in the username `EditText`, something strange happens...

The first character appears and then the application appears to hang. Typing further characters has no effect.

Let's investigate further... Set a breakpoint on `setUsername()` call in the SimpleTextWatcher implementation.

Run the application. Type a character in the `EditText`.

The breakpoint will get hit over and over again.

The application flow is:

* the view is notifying the watcher
* then the watcher is notifying the view model
* then the view model is notifying the view
* then view is notifying the watcher
* then the watcher is notifying the view model
* and on it goes in a loop...

So we'll need to implement a _stop_ in the view model. In essence we'll say, "If the change comes from the view, don't notify the view".

It's worth noting that binding frameworks that implement two-way binding would normally do this check for you...

## Adding a notification stop

Here's our modified view model, which does not raise a data binding notification if the change originated in the watcher:

{% highlight java %}
public class LoginViewModel extends BaseObservable {

    private String username;
    private String password;
    private boolean isInNotification = false;

    private Command loginCommand;

    public LoginViewModel(){
        loginCommand = new Command() {
            @Override
            public void onExecute() {
                Log.d("db", String.format("username=%s;password=%s", username, password));
            }
        };
    }

    @Bindable
    public String getUsername() {
        return this.username;
    }

    @Bindable
    public String getPassword() {
        return this.password;
    }

    public Command getLoginCommand() { return loginCommand; }

    public void setUsername(String username) {
        this.username = username;

        if (!isInNotification)
            notifyPropertyChanged(com.petermajor.databinding.BR.username);
    }

    public void setPassword(String password) {
        this.password = password;

        if (!isInNotification)
            notifyPropertyChanged(com.petermajor.databinding.BR.password);
    }

    @Bindable
    public TextWatcher getOnUsernameChanged() {

        return new SimpleTextWatcher() {
            @Override
            public void onTextChanged(String newValue) {
                isInNotification = true;
                setUsername(newValue);
                isInNotification = false;
            }
        };
    }

    @Bindable
    public TextWatcher getOnPasswordChanged() {

        return new SimpleTextWatcher() {
            @Override
            public void onTextChanged(String newValue) {
                isInNotification = true;
                setPassword(newValue);
                isInNotification = false;
            }
        };
    }
}
{% endhighlight %}

Let's start the app again.

Type _test@test.com_ into the username `EditText`. Everything works as expected.

Click the _Sign in_ button.

Check the log for the values in the view model:

> D/db﹕ username=test@test.com;password=Passw0rd

Success! The value in the `EditText` is the current value in the view model too.

## Wrap Up

The purpose for this series of posts was to implement a simple view model with the Android Data Binding Library.

I wanted to compare this framework with other binding frameworks that I've used to see how it stacks up.

So how does it compare? Here's some things I'd like to point out:

* The current Android implementation is one-way data binding. This is sufficient for read-only views like `TextView`, but this leaves a lot of implementation to the developer for views like `EditText`. 

* The developer has to implement notification stops to prevent recursive notifications. This may not always be obivous and may cause bugs.

* The binding syntax in the XML layout is nice. However the need to bind to _listeners_ and _watchers_ for `Button` clicks and `EditText` text changes means that view implementation tends to leak into view model code.

* Binding directly to methods (which is supposedly supported, but that I could not get working) would definitely help. However these methods will still have view controls in their method signatures.

* The fact that I couldn't get the method binding to compile even though it was in the documentation is a little bit frustrating. The framework (at time of writing this post) is still a __Release Candidate__, so I would expect this to be fixed in a future version.

Here's the bottom line: 

The Android Data Binding Library is a great first step to add native built-in data binding to Android.

However, it is still a very early release that has some bugs.

More importantly, it is missing an important feature that I would consider to be _table stakes_ for any data binding framework - two-way data binding.

This may cause confusion and disappointment for developers coming from other data binding frameworks.

_The code samples for this post can be found in [github](https://github.com/petermajor/AndroidDataBinding/tree/Step4) in branch "Step4"_
