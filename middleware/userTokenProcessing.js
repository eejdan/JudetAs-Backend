

const redis = require('redis');

const client = require('../redisconnection');
const userTokenProcessing = async (req, res, next) => {
    let redisPathString = 'user:sessions:'+req.body.session_id;
    {
        let trySession = await client.exists(redisPathString)
        if(!trySession) {
            return res.sendStatus(401);
        }
    }
    {
        let uid = await client.get(redisPathString+':userid');
        if(!uid) {
            return res.sendStatus(500);
        }
        res.locals.userid = uid; // important
    }
    {
        let tryToken = await client.exists(
            redisPathString + ':tokens:' + req.body.currentAccessToken
        )
        if(!tryToken) {
            return res.sendStatus(401);
        }
        tryToken = await client.get(
            redisPathString + ':tokens:last'
        )
        if(tryToken != req.body.currentAccessToken) {
            return res.sendStatus(401);
        }
    }
    let found = true;
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
    } while(!found);
    await client.set(redisPathString+':tokens:'+newTokenString, true);
    await client.set(redisPathString+":tokens:last", newTokenString);
    await client.set(redisPathString+":tokens:last-date", Date.now());
    res.locals.currentAccessToken = newTokenString;
    res.append('newAccessToken', newTokenString)
    next();
}

module.exports = userTokenProcessing