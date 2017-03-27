//var usersOnline = [];
var room = $('.room-name').attr('data-room');
console.log(room);

// initializing socket, connection to server
var socket = io();


function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}


socket.on('connect', function(data) {
  console.log(socket.io.engine.id);
  var id = socket.io.engine.id;
  var nickname = prompt('What is your nickname?');
  var temp = {name: nickname, id: id};
  //usersOnline.push(temp);
  socket.emit('room', {
    'room': room,
    'nickname': nickname
  });
});

// listener for 'thread' event, which updates messages
socket.on('thread', function(data) {
  $('#thread').append('<li style="background-color: ' + data['color'] + ';">' + data['nickname'] + " said: " + data['message'] + '</li>');
  $('#chat').scrollTop($('#chat')[0].scrollHeight);
});

socket.on('joined', function(data) {
  var usersArray = data['usersOnline'];
  if(!$('#nickname').attr('data-name')) {
    $('#nickname').attr('data-name', data['username']);
    $('#nickname').attr('data-color', data['color']);
  }
  $('#roster').empty();
  console.log(data['roomUsers']);
  for(var userId in data['roomUsers']) {
    for(var i = 0; i < usersArray.length; i++) {
      if(userId == usersArray[i]["id"]) {
        $('#roster').append('<li>' + usersArray[i]["name"] + '</li>');
      }
    }
  }
  /*
  for(var i = 0; i < usersOnline.length; i++) {
    $('#roster').append('<li>' + usersOnline[i] + '</li>');
  }
  */
});

socket.on('updateList', function(data) {
  usersOnline = data['usersOnline'];
  $('#roster').empty();
  for(var userId in data['roomUsers']) {
    for(var i = 0; i < usersOnline.length; i++) {
      if(userId == usersOnline[i]["id"]) {
        $('#roster').append('<li>' + usersOnline[i]["name"] + '</li>');
      }
    }
  }
  /*
  for(var i = 0; i < usersOnline.length; i++) {
    $('#roster').append('<li>' + usersOnline[i] + '</li>');
  }
  */
});

// sends messages to server, resets & prevents default form action
$('#message-form').submit(function() {
  var message = $('#message').val();
  var name = $('#nickname').attr('data-name');
  var color = $('#nickname').attr('data-color');
  socket.emit('messages', {
    'message': message,
    'nickname': name,
    'color': color,
    'room': room
  });
  this.reset();
  return false;
});
