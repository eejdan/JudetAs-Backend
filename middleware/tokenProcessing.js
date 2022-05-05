

const mongoose = require('mongoose')
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});

export function tokenProcessing(req, res, next) {
    if(!req.cookies['unsolved_sid']) {
        return res.sendStatus(401);
    }
    if(!req.cookies['currentAccessToken']) {
        return res.sendStatus(401);
    }
    let keyString = 'sessionAccessTokens:'
        +req.cookies.unsolved_sid+':'
        +req.cookies.currentAccessToken;  
    
    
}