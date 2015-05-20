---
layout: post
title: Native cross-platform mobile apps with C# and Xamarin.Forms
date: 2015-05-20 20:53s:00
categories:
- Xamarin
tags:
- Xamarin
published: true
author: peter_major
comments: true
sitemap:
  priority: 0.6
  changefreq: weekly
---

And now for something completely different!

For the last 9 months I've been working on a mobile application built with Xamarin.

The first version of the app was built for Android using [MvvmCross](https://github.com/MvvmCross/MvvmCross).

When I joined the project, we were just about to start the iOS version of the application and I put forward a proposal to switch out native layouts and MvvmCross and go with [Xamarin.Forms](https://xamarin.com/forms) instead.

Since then, I've learned a lot about mobile app development and Xamarin in particular. Using Xamarin.Forms in a production application has been fascinating, especially dealing with the ups and downs of building a cross-platform application.

Last month I had the pleasure of speaking at [DDD South West 6](http://www.dddsouthwest.com/) on building cross-platform apps with C# and Xamarin.Forms.

Here is a recording of the session and also the companion slides:

<p><div id="ytplayer"></div></p>

<script>
  // Load the IFrame Player API code asynchronously.
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // Replace the 'ytplayer' element with an <iframe> and
  // YouTube player after the API code downloads.
  var player;
  function onYouTubePlayerAPIReady() {
    player = new YT.Player('ytplayer', {
      height: '221',
      width: '320',
      videoId: '88IlyfGX1Yw'
    });
  }
</script>

<p><iframe src="https://www.slideshare.net/slideshow/embed_code/key/IGiUwaeQrt3LiE" width="320" height="269" frameborder="0" marginwidth="0" marginheight="0" scrolling="no"></iframe></p>

