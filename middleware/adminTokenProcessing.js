

const crypto = require("crypto");


const client = require('../redisconnection');

const mongoose = require('mongoose')

const { encrypt, decrypt } = require("../util/encryption");
const generateString = require('../util/generateString');

const adminTokenProcessing = async (req, res, next) => {
    let redisPathString = 'admin:sessions:'+req.body.unsolved_sid;
    { //Verifica daca exista sesiunea
        let trySession = await client.exists(redisPathString)
        if(!trySession) {
            return res.sendStatus(410);
        }
    }
    {
        let uid = await client.get(redisPathString+':userid');
        if(!uid) {
            return res.sendStatus(500);
        }
        res.locals.userid = uid; // important
    }
    { //Verifica daca exista tokenul de access si daca este cel curent
        let tryToken = await client.exists(redisPathString+':tokens:'+req.body.currentAccessToken)
        if(!tryToken) {
            return res.sendStatus(410);
        }
        let tryLast = await client.get(redisPathString+':tokens:last');
        if(tryLast != req.body.currentAccessToken) {
            client.set(redisPathString+':error', 'backtrackedToken');
            client.del(redisPathString)
            return res.sendStatus(401);

        }
    }
    { /*Verifica daca sesiune e autorizata 
        (administratorii vor trebuie sa reintroduca un pin 
        la fiecare jumatate de ora ca sa autorizeze sesiunea) */
        let tryAuthorized = await client.exists(redisPathString+':authorized');
        //cheia :last-authorized expira (se sterge singura) dupa 30 de minute de la autorizare
        if(!tryAuthorized) {
            return res.sendStatus(401);
        }
    }
    let newTokenString;
    do {
        found = true;
        newTokenString = generateString(64);
        let tryStringQuery = await client.exists(
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
    await client.set(redisPathString+':authorized', true,  'EX', (30 * 60));
    res.locals.currentAccessToken = newTokenString;
    res.append('newAccessToken', newTokenString)
    next();
}

module.exports = adminTokenProcessing;