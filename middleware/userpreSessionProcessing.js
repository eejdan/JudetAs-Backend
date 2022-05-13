
const client = require('../redisconnection');
const userpreSessionProcessing = async (req, res, next) => {
    let redisPathString = 'userpre:sessions:'+req.body.session_id;
    {
        let trySession = await client.exists(redisPathString)
        if(!trySession) {
            return res.sendStatus(401);
        }
    }
    {
        let regid = await client.exists(redisPathString+':regid');
        if(!regid) {
            return res.sendStatus(500)
        } //tbd mark for review
        res.locals.regid = regid;
    }
    return next();
}

module.exports = userpreSessionProcessing;