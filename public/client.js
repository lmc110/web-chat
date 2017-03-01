var usersOnline = [];

// initializing socket, connection to server
var socket = io.connect('http://192.168.1.22:7777');


function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}


socket.on('connect', function(data) {
  socket.emit('join', prompt("What's your nickname"));
});

// listener for 'thread' event, which updates messages
socket.on('thread', function(data) {
  console.log(data['color']);
  $('#thread').append('<li style="background-color: ' + data['color'] + ';">' + data['nickname'] + " said: " + data['message'] + '</li>');
  $('#chat').scrollTop($('#chat')[0].scrollHeight);
});

socket.on('joined', function(data) {
  usersOnline = data['clients'];
  if(!$('#nickname').attr('data-name')) {
    $('#nickname').attr('data-name', data['username']);
    $('#nickname').attr('data-color', data['color']);
  }
  console.log(usersOnline);
  $('#roster').empty();
  for(var i = 0; i < usersOnline.length; i++) {
    $('#roster').append('<li>' + usersOnline[i] + '</li>');
  }
});

socket.on('updateList', function(data) {
  usersOnline = data;
  $('#roster').empty();
  for(var i = 0; i < usersOnline.length; i++) {
    $('#roster').append('<li>' + usersOnline[i] + '</li>');
  }
});

// sends messages to server, resets & prevents default form action
$('#message-form').submit(function() {
  var message = $('#message').val();
  var name = $('#nickname').attr('data-name');
  var color = $('#nickname').attr('data-color');
  socket.emit('messages', {
    'message': message,
    'nickname': name,
    'color': color
  });
  this.reset();
  return false;
});
