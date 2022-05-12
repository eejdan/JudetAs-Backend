

const redis = require('redis');
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});

const userTokenProcessing = (req, res, next) => {
    let redisPathString = 'user:sessions:'+req.body.session_id;
    {
        let trySession = await client.EXISTS(redisPathString)
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
        let tryToken = await client.EXISTS(
            redisPathString + ':tokens:' + req.body.currentAccessToken
        )
        if(!tryToken) {
            return res.sendStatus(401);
        }
        tryToken = await client.GET(
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
        let tryStringQuery = await client.EXISTS(
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