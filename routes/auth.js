if (require.main === module) {
    require('dotenv').config();
}
const express = require('express')
const { body, validationResult } = require('express-validator');

const redis = require('redis');
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL
});
const router = express.Router();

router.post('/admin/login', 
    body('username').isAlphanumeric().isLength({ min: 5, max: 48 }), 
    body('password').isString().isLength({ min: 5, max: 48 }),
    body('authorization_code').isString().isLength({ min: 64, max: 64 }),
    (req, res) => { 
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.sendStatus(400);
        }
    }    
)
router.post('/admin/authorize', (req, res) => {
    
})


async function init() {
    client.on('error', (err) => console.log('Redis Client Error', err));
    client.on('connect', () => console.log('Redis client connected'));
    await client.connect();
}
init();
module.exports = router;