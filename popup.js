window.onload = function() {
	var select_name = document.getElementById("select_name");
	var button_signin = document.getElementById("button_signin");

	if (localStorage.length !== 0) {
		for (var e in localStorage) {
			var option = document.createElement("option");
			option.text = e;
			select_name.appendChild(option);
		}
	} else {
		select_name.disabled = true;
		button_signin.disabled = true;
	}

	button_signin.onclick = function() {
		var container = document.getElementById("container");
		for (var i=0; i<container.childNodes.length; i++) {
			if (container.childNodes[i].nodeType === Node.ELEMENT_NODE) {
				container.childNodes[i].style.visibility = "hidden";
			}
		}
		container.style.background = "url('loading.svg') no-repeat center";

		var keypair = JSON.parse(localStorage.getItem(select_name.value));
		var curve = sjcl.ecc.curves.k256;
		var public_key = new sjcl.ecc.ecdsa.publicKey(curve, sjcl.codec.hex.toBits(keypair.pub));
		var secret_exponent = new sjcl.bn(keypair.sec);
		var secret_key = new sjcl.ecc.ecdsa.secretKey(curve, secret_exponent);

		var challenge = chrome.extension.getBackgroundPage().challenge;
		var origin =  chrome.extension.getBackgroundPage().origin;
		// here is the message:
		var msg = JSON.stringify({challenge: challenge, origin: origin, id: select_name.value, public_key: keypair.pub});

		var hash = sjcl.hash.sha256.hash(msg);
		var signed_msg = secret_key.sign(hash);

		// stringify this?
		var packet = JSON.stringify({msg: msg, signature: sjcl.codec.base64.fromBits(signed_msg)});

		var http = new XMLHttpRequest();
		http.onreadystatechange = function() {
			if (http.readyState===4) {
				//gets current tab id and send the packet to the content script
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					var port = chrome.tabs.connect(tabs[0].id);
					port.postMessage(http.responseText);
					window.close();
				});
			}
		};
		http.open("POST", origin+"/dsap", true);
		http.setRequestHeader("Content-type", "application/json");
		http.send(packet);
	};
};

