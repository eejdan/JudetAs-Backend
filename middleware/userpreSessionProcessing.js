
const redis = require('redis');
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});


const userpreSessionProcessing = async (req, res, next) => {
    let redisPathString = 'userpre:sessions:'+req.body.session_id;
    {
        let trySession = await client.EXISTS(redisPathString)
        if(!trySession) {
            return res.sendStatus(401);
        }
    }
    {
        let regid = await client.EXISTS(redisPathString+':regid');
        if(!regid) {
            return res.sendStatus(500)
        } //tbd mark for review
        res.locals.regid = regid;
    }
    return next();
}

module.exports = userpreSessionProcessing;