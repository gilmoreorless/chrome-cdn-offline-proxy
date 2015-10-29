var cdnDomains = [
    'ajax.aspnetcdn.com',
    'ajax.googleapis.com',
    'cdn.jsdelivr.net',
    'cdn.rawgit.com',
    'cdnjs.cloudflare.com',
    'code.jquery.com',
    'aui-cdn.atlassian.com',
    'api.bitbucket.org',
];
var filterDomains = cdnDomains.map(function (domain) {
    return '*://' + domain + '/*';
});
var webRequestFilter = {
    urls: filterDomains,
    types: ['stylesheet', 'script', 'image', 'object', 'xmlhttprequest']
};
var beforeRequestOptions = ['blocking'];

/* Source: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22 */
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

var beforeRequestCallback = function (details) {
    console.log('onBeforeRequest', details);
    if (details.method === 'GET' && details.tabId !== -1) {
        var domain, mime;
        for (var i = 0, ii = cdnDomains.length; i < ii; i++) {
            domain = cdnDomains[i];
            if (details.url.indexOf(domain) > -1) {
                var key = details.url;
                var resBody = sessionStorage.getItem(key);
                console.log('Found item for key?', !!resBody, key);
                if (resBody) {
                    // TODO: Make this actually correct instead of guesswork
                    mime = details.type === 'stylesheet' ? 'text/css' : 'application/javascript';
                    return {
                        redirectUrl: 'data:' + mime + ';base64,' + resBody
                    };
                }
                fetch(key).then(function (response) {
                    return response.text();
                }).then(function (body) {
                    try {
                        sessionStorage.setItem(key, b64EncodeUnicode(body));
                    } catch (e) {
                        console.error('Failed to set item: ' + key, e);
                    }
                });
            }
        }
    }
};

chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallback, webRequestFilter, beforeRequestOptions);
