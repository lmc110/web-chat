var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var randomcolor = require('randomcolor');

var clients = [];
var usersOnline = [];

app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/public/landing.html')
});

app.get('/general', function(req, res, next) {
  res.sendFile(__dirname + '/public/general.html')
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function(client) {
  console.log('Client connected....');

  client.on('room', function(data) {
    var color = randomcolor.randomColor();
    client.user = data['nickname'];
    client.join(data['room']);
    var rm = data['room'];
    console.log(client.id);
    var temp = {name: data['nickname'], id: client.id, room: rm};
    usersOnline.push(temp);
    // list with socket ids and length of clients in the room
    //console.log(io.sockets.adapter.rooms['general']);
    // output socket info of clients in the room
    //console.log(io.sockets.in('general'));
    // output user nickname in the room
    console.log(io.sockets.in(rm).connected[client.id].user);

    io.sockets.in(data['room']).emit('joined', {
      'roomUsers': io.sockets.adapter.rooms[rm].sockets,
      'color': color,
      'username': data['nickname'],
      'usersOnline': usersOnline
    });
    /*
    var color = randomcolor.randomColor();
    client.user = data['nickname'];
    clients.push(data['nickname']);
    client.emit('joined', {
      'clients': clients,
      'username': data['nickname'],
      'color': color
    });
    client.broadcast.emit('joined', {
      'clients': clients,
      'username': username,
      'color': color
    });
    */
  });

  client.on('messages', function(data) {
    io.sockets.in(data['room']).emit('thread', {
      'message': data['message'],
      'nickname': data['nickname'],
      'color': data['color']
    });
    /*
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
    */
  });

  client.on('disconnect', function() {
    //console.log(client.user + ' disconnected');
    //clients.splice(clients.indexOf(client.user), 1);
    console.log(usersOnline);
    for(var i = 0; i < usersOnline.length; i++) {
      if(usersOnline[i]["id"] == client.id) {
        var rm = usersOnline[i]["room"];
        console.log(rm);
        usersOnline.splice(usersOnline.indexOf(client.user), 1);
        console.log(usersOnline);
      }
    }
    client.leave(rm);
    //console.log('Current users ' + clients.length);
    //console.log(clients);
    if(io.sockets.adapter.rooms[rm] === undefined) {
      var roomUsers = [];
    }
    else {
      var roomUsers = io.sockets.adapter.rooms[rm].sockets;
    }
    io.sockets.in(rm).emit('updateList', {
      'roomUsers': roomUsers,
      'usersOnline': usersOnline
    });
    /*
    client.emit('updateList', clients);
    client.broadcast.emit('updateList', clients);
    */
  });

});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
