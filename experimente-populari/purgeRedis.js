if (require.main === module) {
    require('dotenv').config();
}
const redis = require('redis');
const client = redis.createClient({ 
    username: process.env.BACKEND_REDIS_USERNAME, 
    password: process.env.BACKEND_REDIS_PASSWORD,
    url: process.env.BACKEND_REDIS_URL,
});

(async () => {
    client.on('error', (err) => console.log('Redis Client Error', err));
    client.on('connect', () => console.log('Redis client connected'));
    await client.connect();

    let a = await client.KEYS('*')
    console.log("test", a);
})();

