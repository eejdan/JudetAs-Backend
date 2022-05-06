

const crypto = require("crypto");

const redis = require("redis")
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});

const mongoose = require('mongoose')
const UserSession = require('../models/userSession');
const User = require('../models/User')

const { encrypt, decrypt } = require("../util/encryption");
const generateString = require('../util/generateString');

export const adminTokenProcessing = (req, res, next) => {
    let redisPathString = 'admin:sessions:'+req.body.unsolved_sid;
    { //Verifica daca exista sesiunea
        let trySession = await client.EXISTS(redisPathString)
        if(!trySession) {
            return res.status(401).send({
                authFail: 'session'
            });
        }
    }
    { //Verifica daca exista tokenul de access si daca este cel curent
        let tryToken = await client.EXISTS(redisPathString+':tokens:'+req.body.currentAccessToken)
        if(!tryToken) {
            //to remove authFail se trimite numai codul http
            return res.status(401).send({
                authFail: 'token' // numai pentru debugging
            });
        }
        let tryLast = await client.get(redisPathString+':tokens:'+last);
        if(tryLast != req.body.currentAccessToken) {
            client.set(redisPathString+':error', 'backtrackedToken');
            client.DEL(redisPathString)
            return res.status(401).send({
                authFail: 'current-token'
            })

        }
    }
    { /*Verifica daca sesiune e autorizata 
        (administratorii vor trebuie sa reintroduca un pin 
        la fiecare jumatate de ora ca sa autorizeze sesiunea) */
        let tryAuthorized = await client.EXISTS(redisPathString+':authorized');
        //cheia :last-authorized expira (se sterge singura) dupa 30 de minute de la autorizare
        if(!tryAuthorized) {
            return res.status(410).send({
                authFail: 'session-authorization'
            });
        }
    }
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
    // sa incerc fara await la urmatoarele queryuri
    await client.set(redisPathString+':tokens:'+newTokenString, true);
    await client.set(redisPathString+":tokens:last", newTokenString);
    await client.set(redisPathString+":tokens:last-date", Date.now());
    await client.set(redisPathString+':authorized', true, { EX: (30 * 60)});
    res.locals.currentAccessToken = newTokenString;
    
    next();
}

export default adminTokenProcessing;