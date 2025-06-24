// api/index.js
const serverless = require('serverless-http');
const app = require('../app'); // sesuaikan path jika kamu pindahkan

module.exports = serverless(app);
