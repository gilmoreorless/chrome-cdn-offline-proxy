/***** CONFIG *****/

var cdnDomains = [
    'ajax.aspnetcdn.com',
    'ajax.googleapis.com',
    'cdn.jsdelivr.net',
    'cdn.rawgit.com',
    'cdnjs.cloudflare.com',
    'code.jquery.com',
    'aui-cdn.atlassian.com',
    'npmcdn.com',
    'unpkg.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
    // add your other CDN here!
];

/***** END CONFIG *****/

var webRequestFilter = {
    urls: cdnDomains.map(function (domain) {
        return '*://' + domain + '/*';
    }),
    types: ['stylesheet', 'script', 'image', 'object', 'xmlhttprequest']
};

// see https://developer.chrome.com/apps/offline_storage
var storage = chrome.storage.local;

// internal copy of the chrome storage
// TODO: investigate performance & memory consumption
var cache = {}

/* see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22 */
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function amountOfItemsInCache() {
    return '' + Object.keys(cache).length;
};

///// Caching and filter implemention
function addListener() {

    // load storage first, see: http://stackoverflow.com/a/18579032
    storage.get(null, function (_cache) {
        cache = _cache;
        chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallback, webRequestFilter, ['blocking']);
    });
}

function removeListener() {
    chrome.webRequest.onBeforeRequest.removeListener(beforeRequestCallback);
    cache = {};
    storage.clear();
}

// returns content-type without charset ()
function getContentType(headers, details) {
    var contentTypeFallback = details.type === 'stylesheet' ? 'text/css' : 'application/javascript';
    var contentType = headers.get('Content-Type') || contentTypeFallback;
    return contentType.replace(/;\s{0,1}charset=.*/, ''); // charset does not work together with base64
}

function beforeRequestCallback(details) {

    if (details.method === 'GET' && details.tabId !== -1) {
        for (var i = 0, ii = cdnDomains.length; i < ii; i++) {

            var domain = cdnDomains[i];
            if (~details.url.indexOf(domain)) {

                var key = details.url;
                var cachedResponse = cache[key];

                if (cachedResponse) {
                    return {
                        redirectUrl: 'data:' + cachedResponse.contentType + ';base64,' + cachedResponse.bodyEncoded
                    };
                }

                fetch(key).then(function (response) {

                    return response.text()
                        .then(function (responseBody) {

                            var body = b64EncodeUnicode(responseBody);
                            var contentType = getContentType(response.headers, details);

                            return {
                                bodyEncoded: body,
                                contentType: contentType
                            };
                        })
                }).then(function (fullResponse) {
                    try {

                        var storableResponse = {}
                        storableResponse[key] = fullResponse

                        // storing...
                        storage.set(storableResponse);
                        cache[key] = fullResponse;
                        chrome.browserAction.setBadgeText({ text: amountOfItemsInCache() });

                    } catch (e) {
                        console.error('Failed to set item: ' + key, e);
                    }
                });
            }
        }
    }
}


///// Browser action (enable/disable filter)
var cacheIsActive = false;

function handleBrowserAction() {
    setCacheActive(!cacheIsActive);
}

function setCacheActive(isActive) {
    cacheIsActive = !!isActive;
    if (cacheIsActive) {
        addListener();
        chrome.browserAction.setBadgeText({ text: 'ON' });
        chrome.browserAction.setIcon({
            path: {
                19: 'icons/icon-on-19.png',
                38: 'icons/icon-on-38.png'
            }
        });
    } else {
        removeListener();
        chrome.browserAction.setBadgeText({ text: '' });
        chrome.browserAction.setIcon({
            path: {
                19: 'icons/icon-off-19.png',
                38: 'icons/icon-off-38.png'
            }
        });
    }
}

chrome.browserAction.onClicked.addListener(handleBrowserAction);
