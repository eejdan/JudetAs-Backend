if (require.main === module) {
    require('dotenv').config();
}
const express = require('express')
const { body, validationResult } = require('express-validator');
const crypto = require("crypto");

const mongoose = require("mongoose");
const Test = require("../schemas/test");
const User = require("../schemas/user")
const UserSession = require("../schemas/userSession")

const redis = require('redis');
const userSession = require('../schemas/userSession');
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});
const router = express.Router();

router.post('/login', 
    body('username').not().isEmpty().isAlphanumeric().isLength({ min: 5, max: 48 }), 
    body('password').not().isEmpty().isString().isLength({ min: 5, max: 48 }),
    async (req, res) => {
        {
            let errors = validationResult(req);
            if(!errors.isEmpty()) {
                console.log(req.body)
                return res.sendStatus(400);
            }
        }

        let hashObject = crypto.createHash("sha256");
        let user = await User.findOne({ 
            username: req.body.username, 
            password: hashObject.update(req.body.password).digest('hex') 
        }, {_id:1}).exec();
        if(!user) {
            console.log(user);
            return res.sendStatus(401)
        }
        console.log(user)
        let newSessionString = generateString(64);
        let newSession = await userSession.insertOne({
            user: user._id,
            sessionString: newSessionString
        })
        res.cookie('unsolved-sid', newSessionString);
        return res.sendStatus(200);
    }    
)
router.post('/admin/authorize', (req, res) => {
    
})
console.log("pre")
init().catch(err => console.log(err));
async function init() {
    client.on('error', (err) => console.log('Redis Client Error', err));
    client.on('connect', () => console.log('Redis client connected'));

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
}

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

module.exports = router;