window.onload = function() {
	document.getElementById("button_generate").onclick = function() {
		var name = document.getElementById("input_name").value;
		if (name==="") {
			throw "Name empty!"; // TODO
		} else {
			if (localStorage.hasOwnProperty(name)) {
				throw "Use other name!"; // TODO
			} else {
				generate(name);
			}
		}
	};
};

function generate(name) {
	var curve = sjcl.ecc.curves.k256;
	var keypair = sjcl.ecc.ecdsa.generateKeys(curve);

	var pubkey_hex = sjcl.codec.hex.fromBits(keypair.pub.get().x) + sjcl.codec.hex.fromBits(keypair.pub.get().y);
	var seckey_hex = sjcl.codec.hex.fromBits(keypair.sec.get());

	localStorage.setItem(name, JSON.stringify({pub: pubkey_hex, sec: seckey_hex}));

	window.close();
}

