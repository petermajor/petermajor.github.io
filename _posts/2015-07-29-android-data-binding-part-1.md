---
layout: post
title: Android Data Binding (pt. 1)
date: 2015-07-29 08:34:00
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

This is part 1 of a 4 part series: [part 2]({% post_url 2015-07-31-android-data-binding-part-2 %}), [part 3]({% post_url 2015-08-11-android-data-binding-part-3 %}), [part 4]({% post_url 2015-08-19-android-data-binding-part-4 %})

Google introducted Android Data Binding Library at Google I/O this year.

With my WPF background and having used Xamarin Forms for the last year, I'm intrigued to see how Android's new data binding approach compares with other frameworks. If you are too, read on...

## Setup 

One of the things I love about Android development is that whatever issue or question you have, countless people have solved it before you. Google'ing any Android development question yields more search results than you can read.

That, however, is not the case for the data binding library. It's a really new feature (still in RC as I write this post) and pretty much any sample you will find will be how to bind a simple property to a read-only label.

The goto article for getting started is a single page in the Android documentation: [https://developer.android.com/tools/data-binding/guide.html](https://developer.android.com/tools/data-binding/guide.html).

<!--more-->

On my first attempt to use the data binding library I missed this line in the _Build Environment_ section: 

> Also, make sure you are using a compatible version of Android Studio. Android Studio 1.3 adds the code-completion and layout-preview support for data binding.

I tried for an hour to get it working with Android Studio 1.2 with no success.

I would rephrase this as __you must install Android Studio 1.3__.

Since 1.3 is no longer in Canary, you should have updated from 1.2 to 1.3 already, right?

## Why use data binding?

I've looked at a few Data Binding Library samples. All of them demonstrate how to bind a property on an objet to a read-only TextView.

Technically, I suppose that is a _form_ of data binding. But when I say "data binding", I'm thinking [MVVM](https://en.wikipedia.org/wiki/Model_View_ViewModel).

To demonstrate the real power of data binding, I'm going to use an example from an existing platform that has data binding support. 

Below is a login page written in XAML and C# for a Xamarin Forms Android application (please bear with):

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<ContentPage
  xmlns="http://xamarin.com/schemas/2014/forms"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
  x:Class="MyFirstApp.LoginPage"
  Title="Sign In">
  <ContentPage.Content>

    <StackLayout>
      <Label Text="{i18n:Translate UsernameLabel}"/>
      <Entry Text="{Binding Username}"/>
      <Label Text="{i18n:Translate PasswordLabel}"/>
      <Entry Text="{Binding Password}"/>
      <Button Text="{i18n:Translate LoginButton}"
          Command="{Binding DoLoginCommand}" />
    </StackLayout>

  </ContentPage.Content>
</ContentPage>
{% endhighlight %}

{% highlight csharp %}
public class LoginViewModel : BaseViewModel
{
  readonly ILoginCommand _loginCommand;
  readonly IToastService _toastService;

  string _username;
  public string Username {
    get { return _username; } 
    set {
      _username = value;
      NotifyPropertyChanged();
    }
  }

  string _password;
  public string Password {
    get { return _password; } 
    set {
      _password = value;
      NotifyPropertyChanged();
    }
  }

  Command _doLoginCommand;
  public Command DoLoginCommand
  {
    get { return _doLoginCommand; }
  }

  public LoginViewModel(IToastService _toastService, ILoginCommand loginCommand)
  {
    _doLoginCommand = new Command(x=> Login());
    _loginCommand = loginCommand;
    _toastService = toastService;
  }

  async Task Login()
  {
    try {
      await _loginCommand.Execute(Username, Password);

      // do something, user is logged in
    }
    catch(UnauthorizedAccessException) {
      await _toastService.Long("Invalid username or password");
      Password = string.Empty;
    }
  }
}
{% endhighlight %}

Read-only, translated text is being bound to the two `Label` above. This is one-way, one-time data binding and it's not particularly interesting. 

More interesting bindings are for the values in the two `Entry` controls - `TextInput` in Android. Every time a key on the keyboard is typed, the updated Entry value is transmitted _to_ the view-model. That's two-way data binding because changes move from view to view-model (when someone types a key) and from view-model to view (when I write code in the view-model to clear the password on an incorrect attempt).

Even better, I've bound the tap of the `Button` to a `Command` on the view-model. Because the view-model already has up-to-date username and password values, the `DoLoginCommand` function has all the information it needs to execute the login code without querying the view for the values.

The LoginViewModel class is very easy to test and does not need any reference to the Xamarin Forms framework. I think this example demonstrates the power of data binding - moving the UI code from the view to a testable view-model.

## Binding Android-style

The Android code is checked into a github repo at [https://github.com/petermajor/AndroidDataBinding](https://github.com/petermajor/AndroidDataBinding)

I'll be attempting to build an a login screen similar to the sample above, with Android data binding.

I'll incrementally commit changes and checkpoint code with branches, so you can follow along.

### Step 1 - creating the view model and binding the edit text

In the C# sample previously, I created a view model. Let's create an equivalent view model in Java:

{% highlight java %}
package com.petermajor.databinding;

import android.databinding.BaseObservable;
import android.databinding.Bindable;
import android.util.Log;

public class LoginViewModel extends BaseObservable {

    private String username;
    private String password;

    @Bindable
    public String getUsername() {
        return this.username;
    }

    @Bindable
    public String getPassword() {
        return this.password;
    }

    public void setUsername(String username) {
        this.username = username;
        notifyPropertyChanged(com.petermajor.databinding.BR.username);
    }

    public void setPassword(String password) {
        this.password = password;
        notifyPropertyChanged(com.petermajor.databinding.BR.password);
    }
}
{% endhighlight %}

Below is the layout scaffolding - I've omitted most of the attributes for readability, see the source code for full layout:

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<layout xmlns:android="http://schemas.android.com/apk/res/android"
    <data>
        <variable name="viewModel" type="com.petermajor.databinding.LoginViewModel"/>
    </data>
    <LinearLayout>
        <TextView android:text="@string/label_username"/>
        <EditText android:text="@{viewModel.username}"/>
        <TextView android:text="@string/label_username"/>
        <EditText android:text="@{viewModel.password}"/>
        <Button android:text="@string/label_login" />
    </LinearLayout>
</layout>
{% endhighlight %}

And finally the login activity code:

{% highlight java %}
package com.petermajor.databinding;

import android.databinding.DataBindingUtil;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.petermajor.databinding.databinding.ActivityLoginBinding;

public class LoginActivity extends AppCompatActivity {

    private LoginViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        viewModel = new LoginViewModel();
        viewModel.setUsername("peter@petermajor.co.uk");
        viewModel.setPassword("Passw0rd");

        final ActivityLoginBinding binding
            = DataBindingUtil.setContentView(this, R.layout.activity_login);
        binding.setViewModel(viewModel);
    }
}
{% endhighlight %}

If you run the app, the login activity will appear and text in the view model with will be showing in the username and password `EditText` controls.

This is binding from _source_ (view model) to _target_ (view):

![Android project properties](/assets/1-EditTextBinding.png){:.img-384-287 width="384" height="287"}

Result!

## Next steps

In this post, we've:

* covered what we're hoping to achieve with data binding by exploring MVVM and a simple example in another language
* created a basic Android application with the Data Binding Library and got some very basic binding working

In the [next post]({% post_url 2015-07-31-android-data-binding-part-2 %}) post, we'll continue to implement the login activity using MVVM by binding the button click to the view model.

_The code samples for this post can be found in [github](https://github.com/petermajor/AndroidDataBinding/tree/Step1) in branch Step 1_
