var http = require('http');
var fs = require('fs');

var redis = require("redis");
var redis_client = redis.createClient(); // XXX using default db!

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

			response.writeHeader(200, {'Content-Type': 'text/plain'});
			redis_client.get(msg.id, function (err, reply) {
				if (reply) {
					// if we already have this id, we verify the signature:
					console.log("id found!");
					var public_key = new sjcl.ecc.ecdsa.publicKey(curve, sjcl.codec.hex.toBits(reply));
					var hash = sjcl.hash.sha256.hash(packet.msg);
					var signature = sjcl.codec.base64.toBits(packet.signature);

					if (public_key.verify(hash, signature)) {
						response.end(JSON.stringify({cookie: "session=1234567890;", redirect: "/welcome"}));
					} else {
						response.end("error");
					}
				} else {
					// if we don't have the, we add it to the db:
					console.log("new id!");
					redis_client.set(msg.id, msg.public_key);
					response.end(JSON.stringify({cookie: "session=1234567890;", redirect: "/newuser"}));
				}
			});
		});
	} else {
		response.writeHead(200, {'Content-Type': 'text/html'});
		var stream = fs.createReadStream('home.html');
		stream.on('open', function () {
			stream.pipe(response);
		});
	}
}).listen(80);

process.on('SIGTERM', terminate);
process.on('SIGINT', terminate);
function terminate() {
	console.log("\nQuitting...");
	redis_client.quit();
	process.exit();
}

