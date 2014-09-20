---
layout: post
title: Deploying application and OWIN authorization server on separate machines
date: 2014-04-14 21:11:28
author: peter_major
categories:
- Security
tags:
- OWIN
- security
- web development
published: true
sitemap:
  priority: 0.6
  changefreq: weekly
---
## Scenario

Say you've created a web application with the single page application template in Visual Studio 2013. This template creates an authorization service that issues access tokens to secure the API.

Suppose you want to separate out the authorization service from the application. You might want to do this if you're going to create another web application and you want both web applications to use the same authorization service.

![two applications sharing same authentication system](/assets/two-applications-sharing-same-authentication-system-1.png){:.img-auth width="335" height="336"}

<!--more-->

## Problem

If the application and the authorization service are deployed on different machines the application won't be able to read the access token.

This is due to the fact that the authorization service will encrypt and sign the access token with one password and the application will attempt to decrypt and validate the signature using a different password.

If you're hosting the application and authorization service using _Microsoft.Owin.Host.SystemWeb_ then the machine key is used for the signature and encryption. You can see this by looking at the source code:

{% highlight csharp %}
namespace Microsoft.Owin.Host.SystemWeb
{
    internal partial class OwinAppContext
    {
        // snip

        internal void Initialize(Action<IAppBuilder> startup)
        {
            // snip

            builder.Properties[Constants.SecurityDataProtectionProvider] =
                new MachineKeyDataProtectionProvider().ToOwinFunction();
        }
    }
}
{% endhighlight %}

Note: Source code for Katana, an OWIN implementation for Microsoft components, is on [codeplex](https://katanaproject.codeplex.com/)

## A Solution

You could set the two machines to have the same machine key, but these machines aren't really the same machine (you usually do this only for a web farm).

Katana only has one other built in data protector (used when NOT hosting using SystemWeb - like self host) - _DpapiDataProtector_. This also uses a password that varies from machine to machine.

I remember that I had a very similar problem when I used Windows Identity Foundation in a previous project - the authentication cookie was encrypted using the machine key too. In that case it was possible to configure a cookie transform to encrypt and decrypt the cookie using an X509 certificate:

{% highlight csharp %}
var transforms = new ReadOnlyCollection<CookieTransform>(new CookieTransform[]
{
    new DeflateCookieTransform(),
    new RsaEncryptionCookieTransform(e.FederationConfiguration.ServiceCertificate),
    new RsaSignatureCookieTransform(e.FederationConfiguration.ServiceCertificate)
});

var sessionHandler = new SessionSecurityTokenHandler(transforms);

e.FederationConfiguration
    .IdentityConfiguration
    .SecurityTokenHandlers
    .AddOrReplace(sessionHandler);
{% endhighlight %}

If you look at the interface for the cookie transform, it's the exactly the same as the interface for IDataProtector:

{% highlight csharp %}
byte[] Decode(byte[] encoded)

byte[] Encode(byte[] value)
{% endhighlight %}

I created a data provider that signs and then encrypts the data based on a X509 certificate:

{% highlight csharp %}
public class X509DataProtector : IDataProtector
{
    private RsaSignatureCookieTransform signatureTransform;
        
    private RsaEncryptionCookieTransform encryptTransform;

    public X509DataProtector(X509Certificate2 certificate)
    {
        signatureTransform = new RsaSignatureCookieTransform(certificate);
        encryptTransform = new RsaEncryptionCookieTransform(certificate);
    }

    public byte[] Protect(byte[] userData)
    {
        var encrypted = encryptTransform.Encode(userData);
        var signed = signatureTransform.Encode(encrypted);
        return signed;
    }

    public byte[] Unprotect(byte[] protectedData)
    {
        var unsigned = signatureTransform.Decode(protectedData);
        var decrypted = encryptTransform.Decode(unsigned);
        return decrypted;
    }
}
{% endhighlight %}

I then created a data protector provider, which loaded a certificate by thumbprint from the machine store.

Finally I configured OWIN to use the custom data provider by calling __app.SetDataProtectionProvider()__ in my Startup.Auth.cs.

[Google](https://plus.google.com/+PeterMajorUk?rel=author)
