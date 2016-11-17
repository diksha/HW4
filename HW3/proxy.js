  var redis = require('redis')
  var multer  = require('multer')
  var express = require('express')
  var fs      = require('fs')
  var app = express()
  // REDIS
  var client = redis.createClient(6379, '127.0.0.1', {})
  var httpProxy = require('http-proxy')
  var http = require('http')

  var proxy = httpProxy.createProxyServer({});

  client.lpush('queue','http://127.0.0.1:3001');
  client.lpush('queue','http://127.0.0.1:3000');

  var server = http.createServer(function(req, res) {
    client.rpoplpush('queue','queue', function(err, value) {
  	proxy.web(req, res, { target: value });
  	});
  });

  console.log("listening on port 3002")
  server.listen(3002);