window.onload = function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var currentTab = tabs[0].id;
		var port = chrome.tabs.connect(currentTab, {name:"dsap"});

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
			// hide everything and show loader:
			var container = document.getElementById("container");
			for (var i=0; i<container.childNodes.length; i++) {
				if (container.childNodes[i].nodeType === Node.ELEMENT_NODE) {
					container.childNodes[i].style.visibility = "hidden";
				}
			}
			container.style.background = "url('loading.svg') no-repeat center";

			// get the key-pair from the localstorage
			var keypair = JSON.parse(localStorage.getItem(select_name.value));
			var curve = sjcl.ecc.curves.k256;
			var public_key = new sjcl.ecc.ecdsa.publicKey(curve, sjcl.codec.hex.toBits(keypair.pub));
			var secret_exponent = new sjcl.bn(keypair.sec);
			var secret_key = new sjcl.ecc.ecdsa.secretKey(curve, secret_exponent);

			port.postMessage("getData");
			// XXX this is ugly
			port.onMessage.addListener(function(content_message) {
				// here is the message:
				var msg = JSON.stringify({challenge: content_message.challenge, origin: content_message.origin, id: select_name.value, public_key: keypair.pub});

				var hash = sjcl.hash.sha256.hash(msg);
				var signed_msg = secret_key.sign(hash);

				var packet = JSON.stringify({msg: msg, signature: sjcl.codec.base64.fromBits(signed_msg)});

				// send the package using POST
				var http = new XMLHttpRequest();
				http.onreadystatechange = function() {
					if (http.readyState===4) {
						// send the packet to the content script
						port.postMessage(http.responseText);
						window.close();
					}
				};
				http.open("POST", content_message.origin+"/dsap", true);
				http.setRequestHeader("Content-type", "application/json");
				http.send(packet);
			});
		};
	});
};

