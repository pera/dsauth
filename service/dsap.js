var http = require('http');
var fs = require('fs');

//var redis = require("redis");
//var client = redis.createClient();

var sjcl = require('./sjcl');
var curve = sjcl.ecc.curves.k256;

http.createServer(function (request, response) {
	console.log('NEW CONNECTION');
	if (request.method === 'POST') {
		var body = '';
		request.on('data', function (chunk) {
			body += chunk;
		});
		request.on('end', function () {
			console.log("length: "+body.length);
			var packet = JSON.parse(body);
			var msg = JSON.parse(packet.msg);
			console.log("id: "+msg.id);

			var public_key = new sjcl.ecc.ecdsa.publicKey(curve, sjcl.codec.hex.toBits(msg.public_key));
			var hash = sjcl.hash.sha256.hash(packet.msg);
			var signature = sjcl.codec.base64.toBits(packet.signature);

			response.writeHeader(200, {'Content-Type': 'text/plain'});
			if (public_key.verify(hash, signature)) {
				response.end(JSON.stringify({cookie: "session=1234567890;", redirect: "/"}));
			} else {
				response.end("error");
			}
		});
	} else {
		response.writeHead(200, {'Content-Type': 'text/html'});
		var stream = fs.createReadStream('home.html');
		stream.on('open', function () {
			stream.pipe(response);
		});
	}
}).listen(80);

