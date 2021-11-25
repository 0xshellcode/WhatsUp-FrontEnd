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
const repl_1 = __importDefault(require("repl"));
const fs_1 = __importDefault(require("fs"));
const encrypt_rsa_1 = __importDefault(require("encrypt-rsa"));
const prompt = require('prompt-sync')();
const socket = (0, socket_io_client_1.io)('http://localhost:3000');
const sharedKey = [];
var Commands;
(function (Commands) {
    Commands["JoinRoom"] = "Join To Room";
    Commands["Quit"] = "Quit";
})(Commands || (Commands = {}));
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
process.on('SIGINT', function () {
    console.log('Caught interrupt signal');
});
const generateRSAKeys = (username) => {
    const nodeRSA = new encrypt_rsa_1.default();
    const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys();
    // Save the keys locally
    fs_1.default.writeFileSync(`./__rsa-keys__/private-key-${username}`, privateKey);
    fs_1.default.writeFileSync(`./__rsa-keys__/public-key-${username}`, publicKey);
    return publicKey;
};
function storePubKeys(pubkey) {
    return __awaiter(this, void 0, void 0, function* () {
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
        repl_1.default.start({
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
