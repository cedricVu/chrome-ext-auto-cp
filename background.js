// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('Auto Run Extension installed.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "closeTab") {
        chrome.tabs.remove(sender.tab.id);
    }
});
