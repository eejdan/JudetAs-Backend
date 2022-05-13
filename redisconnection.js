if(require.main === module) {
    require('dotenv').config()
}

const Redis = require('ioredis');
const client = new Redis({
    username: 'default',
    password: process.env.BACKEND_REDIS_DEFPASSWORD,
    host: process.env.BACKEND_REDIS_HOST,
    port: process.env.BACKEND_REDIS_PORT,
    retryStrategy: times => {
        var delay = Math.min(times * 50, 2000);
        return delay;
    }
});

module.exports = client;