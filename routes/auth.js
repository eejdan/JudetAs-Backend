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
const AdminRole = require('../models/AdminRole')

const redis = require('redis');
const mongoose = require('mongoose');
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});

const router = express.Router();

router.post('/admin/login', //returneaza response cu o sesiune (neautorizata inca)
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

        redisPathString = redisPathString + newSessionString + ':';

        let newTokenString;
        do {
            newTokenString = generateString(64);
            let tryStringQuery = await client.EXISTS(
                redisPathString + ':tokens:' + newTokenString
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
router.post('/admin/authorize', //ia sesiunea si sesiunea codificata cu pinul returneaza un access token 
    //body checks here TBD
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("solved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    (req, res) => {
    let hashObject = crypto.createHash("sha256");

    let redisPathString = 'admin:sessions:'+req.body.unsolved_sid;
    { //Verifica daca exista sesiunea
        let trySession = await client.EXISTS(redisPathString)
        if(!trySession) {
            return res.status(401).send({
                authFail: 'session'
            });
        }
    }
    //Gaseste userul sesiunii
    let user = await User.findById(await client.get(redisPathString+':userid')).exec();
    if(!user) {
        return res.sendStatus(400);
    }
    {
        let hashObject = crypto.createHash("sha256");
        if(req.body['solved-sid'] != hashObject.update(sid+decrypt(user.pin)).digest('hex')) {
            return res.sendStatus(401)
        }
    }
    let tryAdminRole = await AdminRole.findOne({
        user: mongoose.Types.ObjectId(user._id)
    })
    if(!tryAdminRole) {
        return res.sendStatus(401);
    }
    let found = true;
    let newTokenString;
        do {
            newTokenString = generateString(64);
            let tryStringQuery = await client.EXISTS(
                redisPathString + ':tokens:' + newTokenString
            )
            if(tryStringQuery) {
                found = false;
            }
    } while(!found);
    await client.set(redisPathString + ':tokens:' + newTokenString, true)
    await client.set(redisPathString + ':tokens:last', newTokenString)
    await client.set(redisPathString + ':authorized', true, { EX: (30 * 60) })
    return res.status(201).send({
        currentAccessToken: newTokenString
    })
})
//admin:sessions:${sessionString}:authorized set and expire after 30 minutes

module.exports = router;