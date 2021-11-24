"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const prompt = require('prompt-sync')();
const socket = (0, socket_io_client_1.io)('http://localhost:3000');
const repl = require('repl');
/* enum Commands {
  JoinRoom = 'Join To Room',
  Quit = 'Quit',
}

async function welcome() {
  socket.on('joinRoom:message', (message) => {
    console.log(message.text);
  });
}

async function receiveMessage() {
  socket.on('chat:message', (message) => {
    console.log(`${message.username}: ${message.text.message} `);
  });
}

async function sendMessage() {
  const message = prompt('> ');
  socket.emit('chat:message', { message });
}

async function joinRoom() {
  console.clear();
  const username = prompt('Username: ');
  const roomname = prompt('Room to join: ');
  if (username !== '' && roomname !== '') {
    socket.emit('joinRoom', { username, roomname });
  } else {
    console.error('You should enter all the data');
  }

  welcome();
  sendMessage();
  receiveMessage();
}

async function initCli() {
  console.clear();
  const answers = await inquirer.prompt({
    type: 'list',
    name: 'command',
    message: 'Choose Option',
    choices: Object.values(Commands),
  });

  switch (answers['command']) {
    case Commands.JoinRoom:
      joinRoom();
      break;
  }
}

initCli(); */
const username = prompt('Username: ');
const roomname = prompt('Room to join: ');
if (username !== '' && roomname !== '') {
    socket.emit('joinRoom', { username, roomname });
}
else {
    console.error('You should enter all the data');
}
socket.on('joinRoom:welcome', (message) => {
    console.log(message.text);
});
socket.on('joinRoom:newUser', (message) => {
    console.log(message.text);
});
socket.on('chat:message', (message) => {
    console.log(`${message.username}: ${message.text.message} `);
});
repl.start({
    prompt: '',
    eval: (message) => {
        socket.emit('chat', { message });
    },
});
