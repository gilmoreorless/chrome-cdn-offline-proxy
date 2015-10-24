var filter = {
    urls: ['*://*.madcat/*', '*://ajax.googleapis.com/*'],
    types: ['stylesheet', 'script', 'image', 'object', 'xmlhttprequest']
};
var opt_extraInfoSpec = ['blocking'];

var beforeRequestCallback = function (details) {
    console.log('onBeforeRequest', details);
    if (details.method === 'GET' && details.tabId !== -1) {
        if (details.type === 'stylesheet' && details.url.indexOf('github.madcat') > -1) {
            return {
                redirectUrl: chrome.extension.getURL('fake.css')
            };
        }
        if (details.type === 'script' && details.url.indexOf('googleapis.com') > -1) {
            var key = details.url;
            var resBody = sessionStorage.getItem(key);
            if (!resBody) {
                fetch(key).then(function (response) {
                    return response.text();
                }).then(function (body) {
                    sessionStorage.setItem(key, btoa(body));
                });
            } else {
                return {
                    redirectUrl: 'data:application/javascript;base64,' + resBody
                };
            }
        }
    }
};

chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallback, filter, opt_extraInfoSpec);
