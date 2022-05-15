
if (require.main === module) {
    require('dotenv').config();
}


const mongoose = require('mongoose');

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
const User = require('../models/user');
const AdminRole = require('../models/AdminRole');
const GeneralAdminRole = require('../models/GeneralAdminRole');
const { stdin, stdout } = require('node:process');
const LocalInstance = require('../models/LocalInstance');
const readline = require('node:readline').createInterface({
    input: stdin,
    output: stdout
})

async function init() {
    insertAdminRole('1escapenewspaper');
}

async function insertGeneralAdminRole(username) {
    console.log("test");
    const user = await User.findOne({ username: username }).exec();
    if(!user) {
        console.log("error couldn't find user by username");
        return;
    }
    const GARole = new GeneralAdminRole({ 
        user: user._id,
        atrDate: Date.now()
    });
    await GARole.save();
    console.log("GARole inserted");
}

async function insertAdminRole(username, localInstance) {
    const user = await User.findOne({ username: username }).exec();
    if(!user) {
        console.log("error couldn't find user by username");
        return;
    }
    let li = await LocalInstance.findOne({}).exec();
    let ar = new AdminRole({
        localInstance: li._id,
        user: user._id
    })
    await ar.save();
    console.log("Ar inserted");
}

init();