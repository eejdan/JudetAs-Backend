

const redis = require('redis');

const client = require('../redisconnection');
const userSessionProcessing = async (req, res, next) => {
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

    await client.set(redisPathString+":last-access", Date.now());
    next();
}

module.exports = userSessionProcessing