var httpProxy = require('http-proxy'),
	redis = require('redis');

// USE: createServer(redisPort, redisHost)
exports.createServer = function () {
	
	var args = Array.prototype.slice.call(arguments);
	var client, server;


	if(args.length === 0) {
		// no redis port or host specified... use default.
		client = redis.createClient();
	} else {
		if(!(is("Number", arg[0]) && is("String", arg[1]))) {
			// need to specify both redis port and host 
			var message = "Need to specify BOTH redis port and host";

			throw new Error(message);
    		return;
		}

		client = redis.createClient(arg[0], arg[1]);
	}

	//
	// Create a proxy server backed by redis
	//
	var server = httpProxy.createServer(function (req, res, proxy) {
	  	
	  	// read request headers for host
	  	var host = req.headers.host.split(":");
	   
	  	// query redis to retrieve proxy mapping
		client.get(host, function(err, reply) {
    		var subHost, subPort;
    	
    		if(err) {
    			console.error(err);	
    		}

    		if(reply) {
    			var route = reply.split(":");
    			subHost = route[0];
	  			subPort = route[1];
	  		} else {
	  			// if host and port not specified, default to localhost:80
	  			subHost = "localhost";
	  			subPort = 80;
	  		}
    		
    		proxy.proxyRequest(req, res, {
	    		host: subHost,
	    		port: subPort
	  		});
		});
	});

	return server;
}

//
// UTIL
//
function is(type, obj) {
    var klas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && klas === type;
}