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
		var keypair = JSON.parse(localStorage.getItem(select_name.value));
		var curve = sjcl.ecc.curves.k256;
		var public_key = new sjcl.ecc.ecdsa.publicKey(curve, sjcl.codec.hex.toBits(keypair.pub));
		var secret_exponent = new sjcl.bn(keypair.sec);
		var secret_key = new sjcl.ecc.ecdsa.secretKey(curve, secret_exponent);

		var challenge = chrome.extension.getBackgroundPage().challenge;
		var origin =  chrome.extension.getBackgroundPage().origin;
		// here is the message:
		var msg = JSON.stringify({challenge: challenge, origin: origin, id: select_name.value});

		var hash = sjcl.hash.sha256.hash(msg);
		var signed_msg = secret_key.sign(hash);

		// send this:
		var packet = JSON.stringify({msg: msg, signature: sjcl.codec.base64.fromBits(signed_msg)});
		console.log(packet);

		/*window.close();*/
	}
};
