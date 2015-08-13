---
layout: post
title: Android Data Binding (pt. 2)
date: 2015-07-31 18:34:00
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
  lastmod: 2015-08-11 22:25:00
---

This is part 2 of a n part series: [part 1]({% post_url 2015-07-29-android-data-binding-part-1 %}), [part 3]({% post_url 2015-08-11-android-data-binding-part-3 %})

In the previous post we got an Android application up and running with the Data Binding Library with some simple one-way binding.

In this post, we're continuing the implementation of LoginActivity, attempting to build the view and view model using the MVVM pattern.

## Binding the Button 

Let's revisit how we would bind a button click to a view model method with binding in Xamarin Forms :

{% highlight xml %}
<Button Text="{i18n:Translate LoginButton}" Command="{Binding DoLoginCommand}" />
{% endhighlight %}

{% highlight csharp %}
public class LoginViewModel : BaseViewModel
{
  Command _doLoginCommand;
  public Command DoLoginCommand
  {
    get { return _doLoginCommand; }
  }

  public LoginViewModel()
  {
    _doLoginCommand = new Command(x=> Login());
  }

  async Task Login()
  {
    // do stuff
  }
}
{% endhighlight %}

Let's consider another example, using HTML and AngularJS:

{% highlight html %}
<button ng-click="login.onSubmit()">Sign in</button>
{% endhighlight %}

{% highlight js %}
angular.module('app.login')
  .controller('LoginController',
    function() {
      this.onSubmit = function() {
        // do something
      };
    });
{% endhighlight %}

<!--more-->

### Step 2 - login OnClickListener

In Android, button clicks are typically handled with an OnClickListener.

My first attempt to bind the button click uses this pattern:

{% highlight xml %}
<Button android:text="@string/label_login"
  android:setOnClickListener="@{viewModel.getLoginCommand}"/>
{% endhighlight %}

And the view model implementation:

{% highlight java %}
public class LoginViewModel extends BaseObservable {

  private String username;
  private String password;

  private Button.OnClickListener loginCommand;

  public LoginViewModel(){
    loginCommand = new View.OnClickListener() {
      @Override
      public void onClick(View v) {
        Log.d("db", String.format("username=%s;password=%s", username, password));
      }
    };
  }

  @Bindable
  public String getUsername() { return this.username; }

  @Bindable
  public String getPassword() {
    return this.password;
  }

  public Button.OnClickListener getLoginCommand() { return loginCommand; }

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

The good news: it works! If you start the application and click the button, you will see the following entry in logcat:

> D/db﹕ username=peter@petermajor.co.uk;password=Passw0rd

The bad news: the code is not really in the spirit of MVVM. The view model references `Button.OnClickListener` - a view specific class that really shouldn't in the view model.

The implementation of the `onClick` method has a `View` parameter... how would you write a unit test that passed in a `View` to the view parameter?

### Step 3 - create a Command class to execute button clicks

An easy way to clean this up is to create a [Command](https://en.wikipedia.org/wiki/Command_pattern) class.

This could secretly expose the OnClickListener interface (among others potentially). However, the view model does not need to know about all this View-i-ness. 

{% highlight java %}
package com.petermajor.databinding;

import android.view.View;

public abstract class Command implements View.OnClickListener {

  @Override
  public void onClick(View v) {
    onExecute();
  }

  public abstract void onExecute();
}
{% endhighlight %}

{% highlight java %}
package com.petermajor.databinding;

import android.databinding.BaseObservable;
import android.databinding.Bindable;
import android.util.Log;

public class LoginViewModel extends BaseObservable {

  private String username;
  private String password;

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
    notifyPropertyChanged(com.petermajor.databinding.BR.username);
  }

  public void setPassword(String password) {
    this.password = password;
    notifyPropertyChanged(com.petermajor.databinding.BR.password);
  }
}
{% endhighlight %}

That's better. The view model doesn't know how the caller will execute the command. The view model exposes the command and the details of how Command.onExecute() gets called is hidden away.


### Binding directly to a method

New to the Data Binding Library in RC1 (instead of RC0), the [Android Data Binding Guide](https://developer.android.com/tools/data-binding/guide.html) states that you can bind an `onClick` handler directly to a method on the view model, like so:

{% highlight xml %}
<Button android:text="@string/label_login"
  android:onClick="@{viewModel.onLogin}"/>
{% endhighlight %}

And the view model implementation:

{% highlight java %}
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

    public void onLogin(View view) {
        Log.d("db", String.format("username=%s;password=%s", username, password));
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

However, when compiling I kept getting this error:

Execution failed for task ':app:compileDebugJavaWithJavac'.
java.lang.RuntimeException: failure, see logs for details.
cannot generate view binders java.lang.NullPointerException at
android.databinding.tool.expr.FieldAccessExpr.hasBindableAnnotations(FieldAccessExpr.java:107)

While the simplicity of this approach is very appealing, it still suffers from the problem that the method gets passed an instance of `View`, so I have mixed feelings about whether to use this approach or not (if it compiled for me, which it currently does not).

I've committed the code to branch [Step3-bind-to-method](https://github.com/petermajor/AndroidDataBinding/tree/Step3-bind-to-method)

EDIT: this appears to be [this issue](https://code.google.com/p/android/issues/detail?id=182228)

## Next steps

In this post, we've bound the button click event to a command on the view model. But there's a problem with the view model as it's implemented up to Step 3...

Try running the application, can you find the issue? All will be revealed in the next post...

_The code samples for this post can be found in [github](https://github.com/petermajor/AndroidDataBinding/tree/Step2) in branches Step 2 and Step 3_