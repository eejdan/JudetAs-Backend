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

const mongoose = require('mongoose');
const User = require('../models/User');
const AdminRole = require('../models/AdminRole')

const redis = require('redis');
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
    authFindUser, //finds user returns 401 if not found
    async (req, res) => {
        let found = true;
        let newSessionString;
        let redisPathString = "admin:"+"sessions:";
        do {
            found = true;
            newSessionString = generateString(64);
            let tryStringQuery = await client.EXISTS(
                redisPathString
                +newSessionString
            )
            if(tryStringQuery) {
                found = false;
            }
        }while(!found);

        redisPathString = redisPathString + newSessionString
        /* in momentul ce expira(dispare) cheia admin:sessions:${sessionString} 
        inseamna ca sesiunea nu mai este valida (expired) */
        
        await client.set(redisPathString, true, { 
                EX: (10 * 24 * 60 * 60) 
        })
        await client.set(redisPathString+':userid', res.locals.user._id);
        await client.set(redisPathString+":hitlist", 0);

        res.cookie('unsolved_sid', newSessionString)
        
        return res.status(200).send({
            session_id: newSessionString,
        })
    }
)
router.post('/admin/authorize', //ia sesiunea si sesiunea codificata cu pinul returneaza un access token 
    //body checks here TBD
    body("unsolved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    body("solved_sid").not().isEmpty().isAlphanumeric().isLength(64),
    expressValidation,
    async (req, res) => {
    let redisPathString = 'admin:sessions:'+req.body.unsolved_sid;
    { //Verifica daca exista sesiunea
        let trySession = await client.EXISTS(redisPathString)
        if(!trySession) {
            return res.sendStatus(410);
        }
    }
    { // invalidate session after failed attempts
        let tryHitList = await client.EXISTS(redisPathString+':hitlist');
        if(!tryHitList) {
            await client.set(redisPathString+":hitlist", 0);
        } else {
            await client.INCR(redisPathString+':hitlist');
            if(parseInt(await client.get(redisPathString+':hitlist')) > 5) {
                await client.DEL(redisPathString);
            } 
        }
    }
    //Gaseste userul sesiunii
    var user = await User.findById(await client.get(redisPathString+':userid')).exec();
    if(!user) {
        return res.sendStatus(400);
    }
    {
        let tryAdminRole = await AdminRole.findOne({
            user: user._id
        })
        if(!tryAdminRole) {
            return res.sendStatus(403);
        }
    }
    {
        let hashObject = crypto.createHash("sha256");
        if(req.body['solved-sid'] != hashObject.update(sid+decrypt(user.pin)).digest('hex')) {
            return res.sendStatus(401)
        }
    }
    await client.del(redisPathString + ':hitlist');
    let found = true;
    let newTokenString;
        do {
            found = true;
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


//user:sessions:${sessionString} set and expire after 10 days

router.post('/user/login', 
    body('username').not().isEmpty().isAlphanumeric().isLength({ min: 5, max: 48 }), 
    body('password').not().isEmpty().isString().isLength({ min: 5, max: 48 }),
    expressValidation,
    authFindUser, //pasword verification is in this middleware
    async (req, res) => { //tbd allow userpre logins
    let redisPathString = 'user:sessions:';
    let newSessionString;
    let newTokenString;
    {
        let found = true;
        do {
            found = true;
            newSessionString = generateString(64);
            let tryStringQuery = await client.EXISTS(
                redisPathString
                +newSessionString
            )
            if(tryStringQuery) {
                found = false;
            }
        }while(!found);
        do { //tbd verify all redis paths
            found = true;
            newTokenString = generateString(64);
            let tryStringQuery = await client.EXISTS(
                redisPathString
                +newSessionString+ ':tokens:' +newTokenString
            )
            if(tryStringQuery) {
                found = false;
            }
        }while(!found);
        redisPathString = redisPathString+newSessionString;
        await client.set(redisPathString, true, { EX: (10 * 24 * 60 * 60)});
        await client.set(redisPathString+':tokens:'+newTokenString, true)
        await client.set(redisPathString+':userid', res.locals.user._id);
        await client.set(redisPathString+':tokens:last', newTokenString);

    }
})


module.exports = router;