import inquirer from 'inquirer';
import { io } from 'socket.io-client';
import repl from 'repl';
import fs from 'fs';
import NodeRSA from 'encrypt-rsa';
const prompt = require('prompt-sync')();
const socket = io('http://localhost:3000');

const sharedKey: any = [];

enum Commands {
  JoinRoom = 'Join To Room',
  Quit = 'Quit',
}

const cleanKeys = (username: any): void => {
  fs.unlink(`./__rsa-keys__/private-key-${username}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('The private key has been deleted');
    }
  });

  fs.unlink(`./__rsa-keys__/public-key-${username}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('The public key has been deleted');
    }
  });
};

process.on('SIGINT', function () {
  console.log('Caught interrupt signal');
});

const generateRSAKeys = (username: any) => {
  const nodeRSA = new NodeRSA();
  const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys();

  // Save the keys locally
  fs.writeFileSync(`./__rsa-keys__/private-key-${username}`, privateKey);
  fs.writeFileSync(`./__rsa-keys__/public-key-${username}`, publicKey);

  return publicKey;
};

async function storePubKeys(pubkey: any) {
  socket.on('joinRoom:shareKeys', (keys) => {
    keys.forEach((key: any) => {
      console.log(key);
      let tmpKey = key.toString();
      if (tmpKey !== pubkey) {
        sharedKey.push(key);
        console.log(`Public Key has been stored: ${key}`);
      }
    });
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

/* 


const username = prompt('Username: ');
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

  socket.on('joinRoom:shareKeys', (keys) => {
    keys.forEach((key: any) => {
      console.log(key);
      let tmpKey = key.toString();
      if (tmpKey !== pubkey) {
        sharedKey.push(key);
        console.log(`Public Key has been stored: ${key}`);
      }
    });
  });

repl.start({
  prompt: '',
  eval: (message: any) => {
    socket.emit('chat', { message });
  },
});
 */
