import inquirer from 'inquirer';
import { io } from 'socket.io-client';
const prompt = require('prompt-sync')();
const socket = io('http://localhost:3000');
const repl = require('repl');
import NodeRSA from 'encrypt-rsa';
import path from 'path';
const fs = require('fs');

const sharedKey: any = [];

enum Commands {
  JoinRoom = 'Join To Room',
  Quit = 'Quit',
}

const generateRSAKeys = (username: any) => {
  const nodeRSA = new NodeRSA();
  const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys();

  // Save the keys locally
  fs.writeFileSync(`./__rsa-keys__/private-key-${username}`, privateKey);
  fs.writeFileSync(`./__rsa-keys__/public-key-${username}`, publicKey);

  return publicKey;
};

async function storePubKeys(userPublicKey: any) {
  socket.on('joinRoom:shareKeys', (key) => {
    if (userPublicKey !== key) {
      console.log(`Public Key has been stored: ${key}`);
      sharedKey.push(key);
    }
  });
}

async function quit() {
  console.log('Bye!');
  process.exit();
}

async function welcome() {
  socket.on('joinRoom:welcome', (message) => {
    console.log(message.text);
  });
}

async function newUser() {
  socket.on('joinRoom:newUser', (message) => {
    console.log(message.text);
  });
}

async function receiveMessage() {
  socket.on('chat:message', (message) => {
    console.log(`${message.username}: ${message.text.message} `);
  });
}

async function sendMessage() {
  repl.start({
    prompt: '',
    eval: (message: any) => {
      socket.emit('chat', { message });
    },
  });
}

async function joinRoom() {
  console.clear();
  const username = prompt('Username: ');
  const roomname = prompt('Room to join: ');
  const pubkey = generateRSAKeys(username);

  if (username !== '' && roomname !== '' && pubkey !== '') {
    socket.emit('joinRoom', { username, roomname, pubkey });
  } else {
    console.error('You should enter all the data');
  }

  welcome();
  newUser();
  storePubKeys(pubkey);
  receiveMessage();
  sendMessage();
  console.log(sharedKey);
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
    case Commands.Quit:
      quit();
      break;
  }
}

initCli();

/* const username = prompt('Username: ');
const roomname = prompt('Room to join: ');
if (username !== '' && roomname !== '') {
  socket.emit('joinRoom', { username, roomname });
} else {
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
  eval: (message: any) => {
    socket.emit('chat', { message });
  },
});
 */
