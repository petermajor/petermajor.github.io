---
layout: post
title: Using Restangular and ETags for optimistic concurrency (pt. 2)
date: 2014-06-05 15:20:06
categories:
- AngularJS
tags:
- AngularJS
- ETag
- Restangular
published: true
author: peter_major
sitemap:
  priority: 0.6
  changefreq: weekly
---

This is part 2 of a 2 part series: [part 1]({% post_url 2014-06-05-restangular-and-etags-pt1 %})

I'm going to step you through an ETag implementation based on a sample application I've written on [Github](https://github.com/petermajor/RestangularWithEtag)

## The Application

Let's see the ETag implementation in action:

1. Open the solution In Visual Studio 2013 and press F5 to run the application.
2. Once the web page loads you'll see a list of employees.
3. Click on an the name of an employee and you'll go to the "Edit Employee" screen
4. Now open a __new browser tab__ and navigate to the same employee
5. In tab 1 - change the name of the employee, then click save. No error should occur.
6. In tab 2 - (without refreshing the page) change the name of the employee, then click save. An alert should appear:<br />
[![PreconditionFailure](/assets/PreconditionFailure.png){:.img-520-349 width="520" height="349"}](/assets/PreconditionFailure.png)

<!--more-->

The error occurred because the user in tab 2 is attempting to update an employee that was stale. Here's what happened on the first tab save (top) and the second tab save (bottom):

[![ETag for concurrency](/assets/ETag-for-concurrency.png){:.img-364-770 width="364" height="770"}](/assets/ETag-for-concurrency.png)

## Restangular and ETags

Here's a capture from the Chrome debugger for the first GET on /api/employees/{id}:

[![1-GetEmployee](/assets/1-GetEmployee.png){:.img-630-432 width="630" height="432"}](/assets/1-GetEmployee.png)

Note the __ETag__ header in the response (highlighted in red).

After changing the name and clicking save, Restangular sent the updated employee to PUT /api/employees/{id}:

[![2-PutEmployee](/assets/2-PutEmployee.png){:.img-632-573 width="632" height="573"}](/assets/2-PutEmployee.png)

Note that the same ETag from the GET response was put in an __If-Match__ header on the PUT request. Since the value in the If-Match header matches the current ETag of the employee on the server, it accepted the PUT request and updated the employee and included the new ETag of the updated employee in the response header (highlighted in red).

So how does Restangular know to do this header magic?

Easy. If the ETag header exists in a request or a response then Restangular will put the ETag value in a custom property of the resource called RestangularEtag, as you can see from this debugger watch:

[![3-EmployeeWithRestangularEtag](/assets/3-EmployeeWithRestangularEtag.png){:.img-400-604 width="400" height="604"}](/assets/3-EmployeeWithRestangularEtag.png)

You can rename this property to something else with the following line of javascript in an AngurlarJS .config block:

{% highlight js %}
restangularProvider.setRestangularFields({ etag: 'Etag' });
{% endhighlight %}

Every time Restangular PUTs a resource, it will include an __If-Match__ header if the __RestangularEtag__ property exists on the resource.

## Implementing ETags in the Web API

For the GET /api/employees/{id}, you simply need to put the ETag header in the response.

In line with using IHttpActionResult in Web API 2, I've created a new result that derives from OkNegociatedContentResult that puts the ETag in the header (the magic happens in line 25):

{% highlight csharp %}
public class OkNegotiatedContentWithETagResult
    : OkNegotiatedContentResult
{
    public OkNegotiatedContentWithETagResult(
        T content, string etag, ApiController controller)
        : base(content, controller)
    {
        ETag = etag;
    }

    public string ETag { get; private set; }

    public override Task ExecuteAsync(
        CancellationToken cancellationToken)
    {
        var task = base.ExecuteAsync(cancellationToken);

        return task.ContinueWith(
            AddETagHeader, cancellationToken);
    }

    private HttpResponseMessage AddETagHeader(
        Task task)
    {
        task.Result.Headers.ETag = new EntityTagHeaderValue(ETag);
        return task.Result;
    }
}
{% endhighlight %}

An ETag can be generated however you like, since to the UI it is only an opaque identifier. The two requirements are:

1. If the resource hasn't changed, the ETag should be the same
2. If the resource has changed, the ETag should be the different

Note that ETags do not need to be unique across resources. Some people use date time of last update... in this implementation I used an MD5 hash of the resource itself:

{% highlight csharp %}
public static class ETagExtensions
{
    public static string GenerateETag(this object obj)
    {
        var objJson = JsonConvert.SerializeObject(obj);
        var objJsonBytes = Encoding.ASCII.GetBytes(objJson);

        var hashProvider = new MD5CryptoServiceProvider();
        var hash = hashProvider.ComputeHash(objJsonBytes);

        var etagString = BitConverter.ToString(hash)
            .Replace("-", string.Empty).ToLower();

        return string.Format("\"{0}\"", etagString);
    }
}
{% endhighlight %}

Also note that the ETag value is wrapped in quotes.

Finally, on PUT /api/employees/{id} we just need to check if the ETag in the If-Match header is the same as the current ETag of the resource:

{% highlight csharp %}
[HttpPut]
[Route("{id}")]
public IHttpActionResult Update(string id, Employee employee)
{
    if (!string.Equals(employee.Id, id, StringComparison.Ordinal))
    {
        return BadRequest("Employee Id in resource and URL must match.");
    }

    var existingEmployee = repository.GetById(id);
    if (existingEmployee == null)
    {
        return NotFound();
    }

    var etag = GetETagFromRequest(Request);
    var existingETag = existingEmployee.GenerateETag();
    if (!string.Equals(existingETag, etag, StringComparison.Ordinal))
    {
        return StatusCode(HttpStatusCode.PreconditionFailed);
    }

    repository.Update(employee);

    return OkWithETag(employee);
}
{% endhighlight %}

In lines 16-21, the two ETags are compared and if they are not the same, then __412 Precondition Failed__ is returned.

## Summary

In this post I stepped you through implemented optimistic concurrency using Restangular and ETags.

In the front-end javascript application, this was easy. Restangular took care of everything without any configuration at all!

In the back-end Web API, we had to write code to generate the ETag and return it with the resource. In addition, on the resource PUT we checked the ETag to make sure it was current before updating the resource in the repository.
