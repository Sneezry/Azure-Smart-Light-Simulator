chrome.browserAction.onClicked.addListener(function() {
    window.open(chrome.extension.getURL('smartlight.html'));
})