var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
var httpProxy = require('http-proxy');
var http = require('http');
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
client.del("recent");
client.del("proxyQueue1");
///////////// WEB ROUTES
// var pserver = http.createServer(function(req, res) {
// 	client.rpoplpush('proxyQueue', 'proxyQueue', function(err, reply) {
// 		console.log("Delivering request to: ", reply)
// 		var proxy = httpProxy.createProxyServer({target: reply});
// 		proxy.web(req, res);
// 	})
// });
// pserver.listen(3002);
// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	// ... INSERT HERE.
	client.lpush("recent",req.protocol + "://" + req.get('host') + req.originalUrl, function(err, reply){
  	    client.ltrim("recent",0,4);
    })

	next(); // Passing the request to the next handler in the stack.
});

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
			client.lpush("images",img, function(err, reply) {
				console.log(reply); //prints 2
			});
	  		console.log(img);
		});
	}

   res.status(204).end()
}]);

app.get('/', function(req, res) {
  res.send('hello world')
})

app.get('/set/:key', function(req, res) {
    client.set("key", req.params.key);
    client.expire("key",10)
    res.send('key set for 10 seconds')
})

app.get('/get/recent', function(req, res) {
		client.lrange("recent",0,4, function(err, reply) {
		    console.log(reply); //prints 2
		    res.send(reply);
		});
})

app.get('/get', function(req, res) {
	{
		client.get("key", function(err, reply) {
    	res.send(reply);
		});
	}
})

app.get('/meow', function(req, res) {
   		client.lpop("images",function(err,val){
   	    if(err) throw err;
   	    res.writeHead(200, {'content-type':'text/html'});
   		res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+val+"'/>");
          res.end();
   		})
   })
app.get('/spawn/:port', function(req, res) {
	{
		var port;
		// res.send("New app server at " + req.params.port + " port"); 
		var server_new = app.listen(req.params.port, function () {
  			var host = server_new.address().address
 		    port = server_new.address().port
  			console.log('New app server at http://%s:%s', host, port)
  			res.send("New app server at " + req.params.port + " port"); 
		})
		server_new.on('error', function(err, val){
			res.send(req.params.port + " already in use!")
		});
		client.lpush("proxyQueue1", "http://127.0.0.1:" + req.params.port);
	}
})
app.get('/listservers', function(req, res) {
	{
		client.lrange('proxyQueue1', 0, -1, function(err, servers){
			res.send(servers);
		});		
		client.llen('proxyQueue1', function(err, length){
			console.log(length);
		});
	}
})
app.get('/destroy', function(req, res) {
	{
		var len;
		client.llen('proxyQueue1', function(err, length){
			console.log(length);
			len = length;
			if(len == 1)
			{
				res.send("Cannot destroy the server, only one left!")
				return;
			}
			var rand =  Math.floor(Math.random() * (len));
			
			client.lindex('proxyQueue1', rand, function(err, ind){
				 client.lrem('proxyQueue1', 1, ind);
				 res.send(ind + " port removed!")
			});

		});

	}
})

var server = app.listen(3001, function () {

  var host = server.address().address
  var port = server.address().port

  client.del('proxyQueue1', function(err, reply) {
  	console.log("Deleted old url queue")
  })

  	var url1 = 'http://localhost:'+port

	client.lpush('proxyQueue1', url1, function(err, reply) {
	  	console.log("Added url1 in queue");
	})

  console.log('Example app listening at http://%s:%s', host, port)
})

client.lpush("proxyQueue1", "http://127.0.0.1:3001");