"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const repl_1 = __importDefault(require("repl"));
const fs_1 = __importDefault(require("fs"));
const encrypt_rsa_1 = __importDefault(require("encrypt-rsa"));
const prompt = require('prompt-sync')();
const socket = (0, socket_io_client_1.io)('http://localhost:3000');
const sharedKey = [];
const nodeRSA = new encrypt_rsa_1.default();
const cleanKeys = (username) => {
    fs_1.default.unlink(`./__rsa-keys__/private-key-${username}`, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('The private key has been deleted');
        }
    });
    fs_1.default.unlink(`./__rsa-keys__/public-key-${username}`, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('The public key has been deleted');
        }
    });
};
// RSA Stuff
const generateRSAKeys = (username) => {
    const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys();
    // Save the keys locally
    fs_1.default.writeFileSync(`./__rsa-keys__/private-key-${username}`, privateKey);
    fs_1.default.writeFileSync(`./__rsa-keys__/public-key-${username}`, publicKey);
    return publicKey;
};
const storePubKeys = (pubkey) => {
    socket.on('joinRoom:shareKeys', (keys) => {
        keys.forEach((key) => {
            console.log(key);
            let tmpKey = key.toString();
            if (tmpKey !== pubkey) {
                sharedKey.push(key);
                console.log(`Public Key has been stored: ${key}`);
            }
        });
    });
};
const encryptMessage = (message, sharedKey) => {
    return nodeRSA.encryptStringWithRsaPublicKey({
        text: message,
        keyPath: sharedKey,
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
    repl_1.default.start({
        prompt: '',
        eval: (message) => {
            socket.emit('chat', { message });
        },
    });
};
// Encrypt N Decrypt
const sendEncryptedMessage = (sharedKey) => {
    repl_1.default.start({
        prompt: '',
        eval: (message) => {
            console.log(typeof sharedKey);
            const tmpKey = sharedKey.toString();
            console.log(typeof tmpKey);
            const finalMessage = encryptMessage(message, sharedKey);
            socket.emit('chat', { finalMessage });
        },
    });
};
process.on('SIGINT', (username) => {
    console.log('Caught interrupt signal');
    cleanKeys(username);
});
const joinRoom = () => {
    console.clear();
    const username = prompt('Username: ');
    const roomname = prompt('Room to join: ');
    const pubkey = generateRSAKeys(username);
    if (username !== '' && roomname !== '' && pubkey !== '') {
        socket.emit('joinRoom', { username, roomname, pubkey });
    }
    else {
        console.error('You should enter all the data');
    }
    welcome();
    newUser();
    storePubKeys(pubkey);
    receiveMessage();
    // sendMessage();
    sendEncryptedMessage(sharedKey);
};
joinRoom();
