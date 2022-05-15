if (require.main === module) {
    require('dotenv').config();
}

const { stdin, stdout } = require('process');

const { encrypt, decrypt } = require('../util/encryption');

const randomWords = require('random-words')
const mongoose = require('mongoose');
const crypto = require('crypto');
const readline = require('node:readline').createInterface({
    input: stdin,
    output: stdout
})
const User = require('../models/user');
mongoose.connect(
    'mongodb+srv://'
    +process.env.BACKEND_MONGO_USERNAME
    +':'+process.env.BACKEND_MONGO_PASSWORD
    +'@'+process.env.BACKEND_MONGO_URL, {
        dbName: 'JudetAs',
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);
async function init() {
    readline.question('pin:', pin => {
        readline.question('count:', count => {
            insertRandomUsers(pin, count)
        })
    });
}
async function insertRandomUsers(pin, count) {
    const encryptedPin = encrypt(pin);
    for(let i=0;i<count; i++) {
        let hashObject = crypto.createHash("sha256");
        let firstName = randomWords(1)[0];
        let lastName = randomWords(1)[0];
        let username = '1'+firstName+lastName;
        let password = firstName+lastName+'1';
        let email = '1'+firstName+lastName+'@example.org';
        let passwordHash = hashObject.update(password).digest('hex');
        User.create({
            username: username,
            password: passwordHash,
            pin: encryptedPin,
            email: email,
            registrationDate: Date.now(),
            meta: {
                firstName: firstName,
                lastName: lastName,
            }
        });
    }
}
init();