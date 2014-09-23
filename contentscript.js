// dsap = digital signature authentication protocol

function getDSAP() {
	var metas = document.getElementsByTagName('meta');
	var dsap = metas.dsap || "";
	return (typeof dsap.content === "string" ? dsap.content : ""); // XXX is this necessary?
}

var challenge = getDSAP();

if (challenge) {
	// notify the background page that this page have DSAuth
	chrome.runtime.sendMessage({});

	chrome.runtime.onConnect.addListener(function(port){
		console.assert(port.name === "dsap");
		port.onMessage.addListener(function(msg){
			switch (msg) {
				case "getData":
					port.postMessage({origin: window.location.origin, challenge: challenge});
					break;
				default:
					console.log(msg);
					if (msg!=="error") {
						var response = JSON.parse(msg);
						document.cookie = response.cookie;
						window.location.href = response.redirect;
					}
			}
		});
	});
}
