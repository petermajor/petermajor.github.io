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
---
<p>This is a followup post to <a title="Using Restangular and ETags for optimistic concurrency (pt. 1)" href="http://www.levelupcoder.com/restangular-and-etags-pt1/">Using Restangular and ETags for optimistic concurrency (pt. 1)</a></p>
<p>I'm going to step you through an ETag implementation based on a sample application I've written on GitHub:<br />
<a title="RestangularWithEtag sample" href="https://github.com/petermajor/RestangularWithEtag" target="_blank">https://github.com/petermajor/RestangularWithEtag</a></p>
<h2>The Application</h2>
<p>Let's see the ETag implementation in action:</p>
<ol>
<li>Open the solution In Visual Studio 2013 and press F5 to run the application.</li>
<li>Once the web page loads you'll see a list of employees.</li>
<li>Click on an the name of an employee and you'll go to the "Edit Employee" screen</li>
<li>Now open a <strong>new browser tab</strong> and navigate to the same employee</li>
<li>In tab 1 - change the name of the employee, then click save. No error should occur.</li>
<li>In tab 2 - (without refreshing the page) change the name of the employee, then click save. An alert should appear:<br />
<a href="http://www.levelupcoder.com/wp-content/uploads/2014/06/PreconditionFailure.png"><img class="alignnone wp-image-458 size-full" src="assets/PreconditionFailure.png" alt="PreconditionFailure" width="520" height="349" /></a></li>
</ol>
<p><!--more--></p>
<p>The error occurred because the user in tab 2 is attempting to update an employee that was stale. Here's what happened on the first tab save (top) and the second tab save (bottom):</p>
<p><a href="http://www.levelupcoder.com/wp-content/uploads/2014/06/ETag-for-concurrency.png"><img class="alignnone wp-image-498 size-full" src="assets/ETag-for-concurrency.png" alt="ETag for concurrency" width="364" height="770" /></a></p>
<h2>Restangular and ETags</h2>
<p>Here's a capture from the Chrome debugger for the first GET on /api/employees/{id}:</p>
<p><a href="http://www.levelupcoder.com/wp-content/uploads/2014/06/1-GetEmployee.png"><img class="alignnone wp-image-467 size-full" src="assets/1-GetEmployee.png" alt="1-GetEmployee" width="630" height="432" /></a></p>
<p>Note the <strong>ETag</strong> header in the response (highlighted in red).</p>
<p>After changing the name and clicking save, Restangular sent the updated employee to PUT /api/employees/{id}:</p>
<p><a href="http://www.levelupcoder.com/wp-content/uploads/2014/06/2-PutEmployee.png"><img class="alignnone wp-image-468 size-full" src="assets/2-PutEmployee.png" alt="2-PutEmployee" width="632" height="573" /></a></p>
<p>Note that the same ETag from the GET response was put in an <strong>If-Match</strong> header on the PUT request. Since the value in the If-Match header matches the current ETag of the employee on the server, it accepted the PUT request and updated the employee and included the new ETag of the updated employee in the response header (highlighted in red).</p>
<p>So how does Restangular know to do this header magic?</p>
<p>Easy. If the ETag header exists in a request or a response then Restangular will put the ETag value in a custom property of the resource called RestangularEtag, as you can see from this debugger watch:</p>
<p><a href="http://www.levelupcoder.com/wp-content/uploads/2014/06/3-EmployeeWithRestangularEtag.png"><img class="alignnone wp-image-476 size-full" src="assets/3-EmployeeWithRestangularEtag.png" alt="3-EmployeeWithRestangularEtag" width="400" height="604" /></a></p>
<p>You can rename this property to something else with the following line of javascript in an AngurlarJS .config block:</p>
<p><code>restangularProvider.setRestangularFields({ etag: 'Etag' });</code></p>
<p>Every time Restangular PUTs a resource, it will include an <strong>If-Match</strong> header if the <strong>RestangularEtag</strong> property exists on the resource.</p>
<h2>Implementing ETags in the Web API</h2>
<p>For the GET /api/employees/{id}, you simply need to put the ETag header in the response.</p>
<p>In line with using IHttpActionResult in Web API 2, I've created a new result that derives from OkNegociatedContentResult that puts the ETag in the header (the magic happens in line 25):</p>
<pre class="lang:c# decode:true" title="Result that will return ETag in the header">public class OkNegotiatedContentWithETagResult
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
}</pre>
<p>An ETag can be generated however you like, since to the UI it is only an opaque identifier. The two requirements are:</p>
<ol>
<li>If the resource hasn't changed, the ETag should be the same</li>
<li>If the resource has changed, the ETag should be the different</li>
</ol>
<p>Note that ETags do not need to be unique across resources. Some people use date time of last update... in this implementation I used an MD5 hash of the resource itself:</p>
<pre class="lang:c# decode:true crayon-selected" title="Computing the ETag">public static class ETagExtensions
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
}</pre>
<p>Also note that the ETag value is wrapped in quotes.</p>
<p>Finally, on PUT /api/employees/{id} we just need to check if the ETag in the If-Match header is the same as the current ETag of the resource:</p>
<pre class="lang:c# decode:true" title="Updating the employe in EmployeeController.cs">[HttpPut]
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
}</pre>
<p>In lines 16-21, the two ETags are compared and if they are not the same, then <strong>412 Precondition Failed</strong> is returned.</p>
<h2>Summary</h2>
<p>In this post I stepped you through implemented optimistic concurrency using Restangular and ETags.</p>
<p>In the front-end javascript application, this was easy. Restangular took care of everything without any configuration at all!</p>
<p>In the back-end Web API, we had to write code to generate the ETag and return it with the resource. In addition, on the resource PUT we checked the ETag to make sure it was current before updating the resource in the repository.</p>
<p><a href="https://plus.google.com/+PeterMajorUk?rel=author">Google</a></p>
