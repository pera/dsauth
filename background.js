var origin;
var challenge;

function onRequest(request, sender, sendResponse) {
	origin = request.origin;
	challenge = request.challenge;
	// Show DSAuth icon
	chrome.pageAction.show(sender.tab.id);
	// Return nothing to let the connection be cleaned up.
	sendResponse({});
}

chrome.runtime.onMessage.addListener( onRequest );

