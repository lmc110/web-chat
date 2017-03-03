var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var randomcolor = require('randomcolor');

var clients = [];

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/public/index.html')
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(client) {
  console.log('Client connected....');

  client.on('join', function(username) {
    var color = randomcolor.randomColor();
    client.user = username;
    clients.push(username);
    client.emit('joined', {
      'clients': clients,
      'username': username,
      'color': color
    });
    client.broadcast.emit('joined', {
      'clients': clients,
      'username': username,
      'color': color
    });
  });

  client.on('messages', function(data) {
    client.emit('thread', {
      'message': data['message'],
      'nickname': data['nickname'],
      'color': data['color']
    });
    client.broadcast.emit('thread', {
      'message': data['message'],
      'nickname': data['nickname'],
      'color': data['color']
    });
  });

  client.on('disconnect', function() {
    //console.log(client.user + ' disconnected');
    clients.splice(clients.indexOf(client.user), 1);
    console.log('Current users ' + clients.length);
    //console.log(clients);
    client.emit('updateList', clients);
    client.broadcast.emit('updateList', clients);
  });

});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
