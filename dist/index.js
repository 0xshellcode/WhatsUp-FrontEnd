"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const socket_io_client_1 = require("socket.io-client");
const prompt = require('prompt-sync')();
const socket = (0, socket_io_client_1.io)('http://localhost:3000');
const repl = require('repl');
const encrypt_rsa_1 = __importDefault(require("encrypt-rsa"));
const fs = require('fs');
const sharedKey = [];
var Commands;
(function (Commands) {
    Commands["JoinRoom"] = "Join To Room";
    Commands["Quit"] = "Quit";
})(Commands || (Commands = {}));
const generateRSAKeys = (username) => {
    const nodeRSA = new encrypt_rsa_1.default();
    const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys();
    // Save the keys locally
    fs.writeFileSync(`./__rsa-keys__/private-key-${username}`, privateKey);
    fs.writeFileSync(`./__rsa-keys__/public-key-${username}`, publicKey);
    return publicKey;
};
function storePubKeys(userPublicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        socket.on('joinRoom:shareKeys', (key) => {
            if (userPublicKey !== key) {
                console.log(`Public Key has been stored: ${key}`);
                sharedKey.push(key);
            }
        });
    });
}
function quit() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Bye!');
        process.exit();
    });
}
function welcome() {
    return __awaiter(this, void 0, void 0, function* () {
        socket.on('joinRoom:welcome', (message) => {
            console.log(message.text);
        });
    });
}
function newUser() {
    return __awaiter(this, void 0, void 0, function* () {
        socket.on('joinRoom:newUser', (message) => {
            console.log(message.text);
        });
    });
}
function receiveMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        socket.on('chat:message', (message) => {
            console.log(`${message.username}: ${message.text.message} `);
        });
    });
}
function sendMessage() {
    return __awaiter(this, void 0, void 0, function* () {
        repl.start({
            prompt: '',
            eval: (message) => {
                socket.emit('chat', { message });
            },
        });
    });
}
function joinRoom() {
    return __awaiter(this, void 0, void 0, function* () {
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
        sendMessage();
        console.log(sharedKey);
    });
}
function initCli() {
    return __awaiter(this, void 0, void 0, function* () {
        console.clear();
        const answers = yield inquirer_1.default.prompt({
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
    });
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
