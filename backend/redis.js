const Redis = require('ioredis');
const redis = new Redis();  // connect to host:127.0.0.1 ; port:6379

redis.on('error', (error) => {
    console.log('Redis client error: ', error);
});

redis.on('connect', () => {
    console.log('Redis connected successfully!');
});

module.exports = redis;