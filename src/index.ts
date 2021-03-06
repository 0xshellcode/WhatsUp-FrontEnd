import { io } from 'socket.io-client';
import repl from 'repl';
import fs from 'fs';
import NodeRSA from 'encrypt-rsa';
const prompt = require('prompt-sync')();
// const socket = io('https://localhost:5001', { rejectUnauthorized: false });

const socket = io('https://137.184.110.108', { rejectUnauthorized: false });
const nodeRSA = new NodeRSA();

/* const cleanKeys = (username: any): void => {
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
}; */

// RSA Stuff

const generateRSAKeys = (username: any) => {
  const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys();

  // Save the keys locally

  fs.writeFileSync(`./__rsa-keys__/private-key-${username}`, privateKey);
  fs.writeFileSync(`./__rsa-keys__/public-key-${username}`, publicKey);

  return publicKey;
};

const storePubKeys = (pubkey: any, username: any) => {
  socket.on('joinRoom:shareKeys', (keys) => {
    keys.forEach((key: any) => {
      let tmpKey = key.toString();
      if (tmpKey !== pubkey) {
        fs.writeFileSync(`./__rsa-keys__/sharedKeyFor-${username}`, key);
        console.log(`Public Key has been stored: ${key}`);
      }
    });
  });
};

const encryptMessage = (message: any, username: any) => {
  return nodeRSA.encryptStringWithRsaPublicKey({
    text: message,
    keyPath: `./__rsa-keys__/sharedKeyFor-${username}`,
  });
};

const decryptMessage = (message: any, username: any) => {
  return nodeRSA.decryptStringWithRsaPrivateKey({
    text: message,
    keyPath: `./__rsa-keys__/private-key-${username}`,
  });
};

// Chat Funtions

const welcome = () => {
  socket.on('joinRoom:welcome', (message) => {
    console.log(message.text);
  });
};

const newUser = () => {
  socket.on('joinRoom:newUser', (message) => {
    console.log(message.text);
  });
};

const receiveMessage = () => {
  socket.on('chat:message', (message) => {
    console.log(`${message.username}: ${message.text.message} `);
  });
};

const sendMessage = () => {
  repl.start({
    prompt: '',
    eval: (message: any) => {
      socket.emit('chat', { message });
    },
  });
};

// Encrypt N Decrypt

const sendEncryptedMessage = (username: any) => {
  repl.start({
    prompt: '',
    eval: (message: any) => {
      message = encryptMessage(message, username);
      socket.emit('chat', { message });
    },
  });
};

const receiveDecryptedMessage = (username: any) => {
  socket.on('chat:message', (message) => {
    const decryptedMessage = decryptMessage(message.text.message, username);
    console.log(`${message.username}: ${decryptedMessage} `);
  });
};

// Main Function

const joinRoom = () => {
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
  storePubKeys(pubkey, username);
  //receiveMessage();
  //sendMessage();
  receiveDecryptedMessage(username);
  sendEncryptedMessage(username);
};

joinRoom();
