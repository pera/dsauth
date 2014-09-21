var http = require('http');
var fs = require('fs');

http.createServer(function (request, response) {
	console.log('NEW CONNECTION');
	if (request.method === 'POST') {
		var body = '';
		request.on('data', function (chunk) {
			body += chunk;
		});
		request.on('end', function () {
			console.log(body);
		});
	} else {
		response.writeHead(200, {'Content-Type': 'text/html'});
		var stream = fs.createReadStream('home.html');
		stream.on('open', function () {
			stream.pipe(response);
		});
	}
}).listen(80);

