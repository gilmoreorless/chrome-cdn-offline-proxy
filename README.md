# CDN offline proxy/cache

A proof-of-concept Chrome browser extension to help with offline web development.


## What it does

When set to active mode, this extension will:

1. Look for any files loaded from certain well-known Content Delivery Network (CDN) domains. This includes JS, CSS, images and any other file types typically loaded from CDNs.
2. Save a copy of the files in a local cache.
3. Intercept any future requests to those files and respond with the locally cached version without hitting the network.


## Why it’s needed

More and more websites are loading front-end dependencies via common CDNs such as [cdnjs](https://cdnjs.com/). This is great for performance and dependency maintenance. But for anyone like me who does a lot of development without a network connection (e.g. while on a train), these CDN dependencies become a problem.

What I wanted was a super-simple way to _optionally_ cache CDN-loaded files offline. That way I could continue to do web development on the train, without tethering to my phone and churning through its data plan (and battery). My primary aim was to not make any changes to the site I was working on — the offline caching should be entirely transparent.

So this extension is a simple one-click on/off caching/proxy setup. It’s very much just a prototype right now, but it’s all I need. It can also be modified to cache API calls to web services (it only works on GET requests though, by design).


## Limitations

* The list of CDN domains is hard-coded, so if your site/app has a custom CDN setup it won’t be recognised.
* The files are cached as Base64-encoded data using `sessionStorage`, so the size of the cache is entirely dependent on the storage limits that Chrome allows.
* There’s no option to clear the cache on request. But since it’s only using `sessionStorage`, a simple disable/enable of the extension will clear it (as will a restart of the browser).
* As listed above, a restart of the browser will clear the cache. This may or may not be the desired behaviour.
* Due to having to use a URL redirect when loading from the cache, relative file paths get changed. This means that any file referenced as a relative URL in a CSS file (e.g. images and fonts) will not be loaded properly.
* It has a fugly icon to remind you (and me) that this is only a prototype. :wink:
* It’s not on the Chrome Web Store, for all the above reasons.


## Ideal future

Really, the right way to do this would be to use a proper web proxy server. But proxy servers can be a pain in the arse to set up — I really wanted a dead-simple setup with a one-click activation.

Chrome extensions can switch Chrome to use a defined proxy server, so a potential option for this:

1. Create a really basic proxy server that can be installed via a single command (e.g. via `npm`, `pip` or `gem`).
2. Make sure the proxy server can be turned on or off with a single command.
3. Change the Chrome extension to just be a simple on/off switch that talks to the proxy server.

In this way it would work a lot like [LiveReload](http://livereload.com/), where the browser extensions talk to the LiveReload server/app via a predefined port number.

Another enhancement would be allowing users to add custom CDN domains to be cached. This would benefits projects that don’t necessarily use CDNs, but have multiple sites referencing a single common assets path (e.g. [hoodie-css](http://hoodiehq.github.io/hoodie-css/)).

