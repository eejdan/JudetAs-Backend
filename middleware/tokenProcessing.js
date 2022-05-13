

const mongoose = require('mongoose')

const client = require('../redisconnection');

function tokenProcessing(req, res, next) {
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

module.exports = tokenProcessing