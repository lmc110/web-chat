var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var clients = [];

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/public/index.html')
});

app.use(express.static('public'));

io.on('connection', function(client) {
  console.log('Client connected....');

  client.on('join', function(username) {
    console.log(username);
    client.user = username;
    clients.push(username);
    client.emit('joined', {
      'clients': clients,
      'username': username
    });
    client.broadcast.emit('joined', {
      'clients': clients,
      'username': username
    });
  });

  client.on('messages', function(data) {
    client.emit('thread', {
      'message': data['message'],
      'nickname': data['nickname']
    });
    client.broadcast.emit('thread', {
      'message': data['message'],
      'nickname': data['nickname']
    });
  });

  client.on('disconnect', function() {
    console.log('Current users ' + clients.length);
    console.log(client.user + ' disconnected');
    clients.splice(clients.indexOf(client.user), 1);
    console.log('Current users ' + clients.length);
    console.log(clients);
    client.emit('updateList', clients);
    client.broadcast.emit('updateList', clients);
  });

});

server.listen(7777);
