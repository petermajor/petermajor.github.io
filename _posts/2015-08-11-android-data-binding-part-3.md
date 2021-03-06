---
layout: post
title: Android Data Binding (pt. 3)
date: 2015-08-11 22:25:00
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
  lastmod: 2015-08-19 22:00:00
---

This is part 3 of a 4 part series: [part 1]({% post_url 2015-07-29-android-data-binding-part-1 %}), [part 2]({% post_url 2015-07-31-android-data-binding-part-2 %}), [part 4]({% post_url 2015-08-19-android-data-binding-part-4 %})

In previous posts we got an Android application up and running with the Data Binding Library with binding to an `EditText`. We also bound a `Button` click to a command on the view model.

However, there was a problem with the code that we left in step 3. Did you spot it?

The issue is... if you change the text in the username or password `EditText` and then click the _Sign In_ button, the _username_ and _password_ properties on the view model will still have the original string values, not the changed values... Huh, why's that?

## Understanding Android Data Binding

Under the covers, Android data binding is really just code generated by an Android Studio plug-in that connects the view and the view model.

You can examine the generated code here: __app/build/intermediates/classes/debug/com/petermajor/databinding/databinding/ActivityLoginBinding.java__

<!--more-->

That one file contains most of the magic... We've already used this class in our activity. Remember this?

{% highlight java %}
@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);

  viewModel = new LoginViewModel();
  viewModel.setUsername("peter@petermajor.co.uk");
  viewModel.setPassword("Passw0rd");

  final ActivityLoginBinding binding = DataBindingUtil.setContentView(
    this, R.layout.activity_login);
  binding.setViewModel(viewModel);
}
{% endhighlight %}

In the constructor, the generated code finds all the components that have bindings and puts them into member variables:

{% highlight java %}
public ActivityLoginBinding(View root) {
  super(root, 1);
  final Object[] bindings = mapBindings(root, 4, sIncludes, sViewsWithIds);
  this.buttonLogin = (android.widget.Button) bindings[3];
  this.buttonLogin.setTag(null);
  this.inputPassword = (android.widget.EditText) bindings[2];
  this.inputPassword.setTag(null);
  this.inputUsername = (android.widget.EditText) bindings[1];
  this.inputUsername.setTag(null);
  this.mboundView0 = (android.widget.LinearLayout) bindings[0];
  this.mboundView0.setTag(null);
  setRootTag(root);
  invalidateAll();
}
{% endhighlight %}

Above you can see that __inputUsername__ `EditText` is found and put into an appropriate member variable on the binding class. This would be very similar to the code you would normally write in your activity with `findViewById()`.

The base class for __ActivityLoginBinding__ is __android.databinding.ViewDataBinding__. That class listens for changes on our observable object (our view model) and passes all notifications to `ActivityLoginBinding.onFieldChanged()`.

This method tracks which values have changed by setting "dirty" flags:

{% highlight java %}
@Override
protected boolean onFieldChange(int localFieldId, Object object, int fieldId) {
  switch (localFieldId) {
    case 0 :
      return onChangeViewModel((com.petermajor.databinding.LoginViewModel) object, fieldId);
  }
  return false;
}
private boolean onChangeViewModel(com.petermajor.databinding.LoginViewModel viewModel, int fieldId) {
  switch (fieldId) {
    case BR.username:
      synchronized(this) {
          mDirtyFlags |= 0b10L;
      }
      return true;
    case BR.password:
      synchronized(this) {
          mDirtyFlags |= 0b100L;
      }
      return true;
    case BR._all:
      synchronized(this) {
          mDirtyFlags |= 0b1L;
      }
      return true;
  }
  return false;
}
{% endhighlight %}

At the point where Android decides to update the bindings, it then calls `executeBindings()`, which updates bound controls where values are dirty:

{% highlight java %}
@Override
protected void executeBindings() {
    long dirtyFlags = 0;
    synchronized(this) {
        dirtyFlags = mDirtyFlags;
        mDirtyFlags = 0;
    }
    java.lang.String usernameViewModel = null;
    com.petermajor.databinding.LoginViewModel viewModel = mViewModel;
    com.petermajor.databinding.Command getLoginCommandViewModel = null;
    java.lang.String passwordViewModel = null;

    if ((dirtyFlags & 0b1111L) != 0) {
        if ((dirtyFlags & 0b1011L) != 0) {
        
            // read username~.~viewModel~
            if ( viewModel != null) {
                usernameViewModel = viewModel.getUsername();
            }
        }
    
        if ((dirtyFlags & 0b1001L) != 0) {
            // read getLoginCommand~.~viewModel~
            if ( viewModel != null) {
                getLoginCommandViewModel = viewModel.getLoginCommand();
            }
        }
    
        if ((dirtyFlags & 0b1101L) != 0) {
            // read password~.~viewModel~
            if ( viewModel != null) {
                passwordViewModel = viewModel.getPassword();
            }
        }
    }
    // batch finished
    if ((dirtyFlags & 0b1001L) != 0) {
        // api target 1
        this.buttonLogin.setOnClickListener(getLoginCommandViewModel);
    }
    if ((dirtyFlags & 0b1101L) != 0) {
        // api target 1
        this.inputPassword.setText(passwordViewModel);
    }
    if ((dirtyFlags & 0b1011L) != 0) {
        // api target 1
        this.inputUsername.setText(usernameViewModel);
    }
}
{% endhighlight %}

## Data Binding... One-Way

The code in __ActivityLoginBinding__ listens for changes in the observable object and propagates the values of dirty fields to the appropriate views.

Notice, however, that there is no generated code that does the opposite - listen for changes in the value of a view and propagate that change to the observable object.

In WPF this type of binding is the default for some views - like `Label` / `TextView`. Because when would a value in a label change and need to be propagated back to the view model? WPF calls this "one-way" data binding and it's cheap because you only set up a watch in one direction.

WPF also has a concept of "two-way" binding for views where bound values _can_ change, like `TextBox` / `EditText`. When values in the view change, they can be propagated back to the view model - either on keypress or when the view loses focus, depending on the configuration of the binding.

This type of binding uses more system resources, because it's watching the value in both locations - view and view model.

It appears that Android does not support two-way binding in this first implementation. I would be interested to hear what offical position is on automatic two-way binding from the team.

## Next steps

In this post, we examined the generated classes that implement the data binding "magic" in the Android Data Binding Library.

This confirmed the "one-way" binding behavior we're seeing with `EditText` views.

In the next post, we'll finish the view model so that updates in the `EditText` will propagate changes back to the view model.
