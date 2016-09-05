# CDN offline proxy/cache

![icon](icons/icon-on-128.png)

A chrome browser extension to help with offline web development.


## What it does

When set to active mode, this extension will:

1. Look for any files loaded from certain well-known Content Delivery Network (CDN) domains.
   This includes JS, CSS, images and any other file types typically loaded from CDNs.
2. Save a copy of the files in a local cache ([chrome.storage.local](https://developer.chrome.com/apps/offline_storage)).
3. Intercept any future requests to those files and respond with the locally cached version without hitting the network.


## Why it’s needed

More and more websites are loading front-end dependencies via common CDNs such as [cdnjs](https://cdnjs.com/).
This is great for performance and dependency maintenance.
But for anyone who does a lot of development without a network connection (e.g. while on a train),
these CDN dependencies become a problem.

This plugin a super-simple way to cache CDN-loaded files offline.
That way you can continue to do web development on the train,
without tethering to the phone and churning through its data plan (and battery).
So this extension is a simple one-click on/off caching/proxy setup.
A simple disable/enable of the extension will clear the cache again.


## Limitations

* The list of CDN domains is hard-coded, so if your site/app has a custom CDN setup it won’t be recognised until you extend the list by hand. Feel free to send PR to extend the list.
* Due to having to use a URL redirect when loading from the cache, relative file paths get changed. This means that any file referenced as a relative URL in a CSS file (e.g. images and fonts) will not be loaded properly.
* It’s not on the Chrome Web Store, for now.

## Licence

[The MIT License (MIT)](LICENSE)  

Copyright (c) 2015 Gilmore Davidson  
Copyright (c) 2016 Johannes Hoppe  

This i a fork of [gilmoreorless/chrome-cdn-offline-proxy](https://github.com/gilmoreorless/chrome-cdn-offline-proxy).  
Obviously we both travel by train very often.
