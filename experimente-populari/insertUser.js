if (require.main === module) {
    require('dotenv').config();
}

const { stdin, stdout } = require('process');

const { encrypt, decrypt } = require('../util/encryption');

const randomWords = require('random-words')
const mongoose = require('mongoose');
const sha256 = require('crypto').createHash("sha256");
const readline = require('node:readline').createInterface({
    input: stdin,
    output: stdout
})
const User = require('../schemas/user');
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
    readline.question('Username:', username => {
        readline.question('Password:', password => {
            readline.question('Pin:', pin => {
                insertUser(username, password, pin);
            })
        })
    });
}
async function insertUser(username, password, pin) {
    const hash = sha256.update(password).digest('hex');
    const encryptedPin = encrypt(pin)
    await User.create({
        username: username, // ##0001
        password: hash, 
        pin: encryptedPin,
        firstName: randomWords(1)[0],
        lastName: randomWords(1)[0],
        registrationDate: Date.now(),
        
    })
    stdout.write('user created')
}
init();