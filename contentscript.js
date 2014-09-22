// dsap = digital signature authentication protocol

function getDSAP() {
	var metas = document.getElementsByTagName('meta');
	var dsap = metas.dsap || "";
	return (typeof dsap.content === "string" ? dsap.content : ""); // XXX is this necessary?
}

var challenge = getDSAP();

if (challenge) {
	chrome.runtime.sendMessage({origin: window.location.origin, challenge: challenge});
}

chrome.runtime.onConnect.addListener(function(port){
	//console.assert(port.name === "dsap");
	console.log(port);
	port.onMessage.addListener(function(msg){
		console.log(msg);
	});
});
