if (require.main === module) {
    require('dotenv').config();
}

const express = require('express');
const { body } = require('express-validator');
const crypto = require("crypto");

const { encrypt, decrypt } = require('../util/encryption');
const generateString = require('../util/generateString');

const expressValidation = require('../middleware/expressValidation');
const authFindUser = require('../middleware/authFindUser');

const User = require('../models/User');
const UserSession = require('../models/userSession');

const redis = require('redis');
const mongoose = require('mongoose');
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});

const router = express.Router();

router.post('/login', 
    body('username').not().isEmpty().isAlphanumeric().isLength({ min: 5, max: 48 }), 
    body('password').not().isEmpty().isString().isLength({ min: 5, max: 48 }),
    expressValidation,
    authFindUser, 
    async (req, res) => {
        let found = true;
        let newSessionString;
        let redisPathString = "admin:"+"sessions:";
        do {
            newSessionString = generateString(64);
            let tryStringQuery = await client.EXISTS(
                redisPathString
                +newSessionString
            )
            if(tryStringQuery) {
                found = false;
            }
        }while(!found);
        /* in momentul ce expira(dispare) cheia admin:sessions:${sessionString} 
        inseamna ca sesiunea nu mai este valida (expired) */
        client.set(redisPathString+newSessionString, true, 
            { EX: (10 * 24 * 60 * 60) }
        )
        client.set(redisPathString+newSessionString+':userid', user._id);
        let session = new UserSession({
            user: mongoose.Types.ObjectId(res.locals.user._id),
            sessionString: newSessionString
        })
        session.save((err) => console.log(error));
        let newTokenString;
        do {
            newTokenString = generateString(64);
            let tryStringQuery = await client.EXISTS(
                redisPathString + newSessionString + ':tokens'
            )
            if(tryStringQuery) {
                found = false;
            }
        } while(!found)
        redisPathString = redisPathString + newSessionString + ':'
        client.set(redisPathString+"tokens:"+newTokenString, true);
        client.set(redisPathString+"tokens:last", newTokenString);
        client.set(redisPathString+"tokens:last-date", Date.now());
    }
)
//admin:sessions:${sessionString}:authorized set and expire after 30 minutes

module.exports = router;