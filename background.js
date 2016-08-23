/***** CONFIG *****/

var cdnDomains = [
    'ajax.aspnetcdn.com',
    'ajax.googleapis.com',
    'cdn.jsdelivr.net',
    'cdn.rawgit.com',
    'cdnjs.cloudflare.com',
    'code.jquery.com',
    'aui-cdn.atlassian.com',
    'npmcdn.com'
];

/***** END CONFIG *****/


///// Storage and options

var filterDomains = cdnDomains.map(function (domain) {
    return '*://' + domain + '/*';
});
var webRequestFilter = {
    urls: filterDomains,
    types: ['stylesheet', 'script', 'image', 'object', 'xmlhttprequest']
};
var beforeRequestOptions = ['blocking'];
var cacheIsActive = false;


///// Helper methods

/* Source: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22 */
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

// unfortionally `sessionStorage` has very strict quota of 5MB, see https://developer.chrome.com/apps/offline_storage 
// unfortionally `chrome.storage.local` is async and does not work nicely together with the callback
var storage = chrome.storage.local;

///// Caching and filter implemention

function beforeRequestCallback(details) {

    if (details.method === 'GET' && details.tabId !== -1) {
        for (var i = 0, ii = cdnDomains.length; i < ii; i++) {
            
            var domain = cdnDomains[i];
            if (~details.url.indexOf(domain)) {

                var key = details.url;
                var cachedResponse = storage.get(key) // ?? TODO!

                if (cachedResponse) {

                    // TODO: Make this actually correct instead of guesswork
                    var mime = details.type === 'stylesheet' ? 'text/css' : 'application/javascript';
                    var resBody = cachedResponse.body;

                    return {
                        redirectUrl: 'data:' + mime + ';base64,' + b64EncodeUnicode(resBody)
                    };
                }

                fetch(key).then(function (resBody) {
                    return resBody.text();
                }).then(function (responseBody) {
                    try {

                        var resp = {
                            key: {
                                body: (responseBody)
                            }
                        }

                        storage.set(resp)
                    } catch (e) {
                        console.error('Failed to set item: ' + key, e);
                    }
                });
            }
        }
    }
}


///// Browser action (enable/disable filter)

function handleBrowserAction() {
    setCacheActive(!cacheIsActive);
}

function setCacheActive(isActive) {
    cacheIsActive = !!isActive;
    if (cacheIsActive) {
        chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallback, webRequestFilter, beforeRequestOptions);
        chrome.browserAction.setBadgeText({ text: 'ON' });
        chrome.browserAction.setIcon({
            path: {
                19: 'icons/icon-on-19.png',
                38: 'icons/icon-on-38.png'
            }
        });
    } else {
        chrome.webRequest.onBeforeRequest.removeListener(beforeRequestCallback, webRequestFilter, beforeRequestOptions);
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
