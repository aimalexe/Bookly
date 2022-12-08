const app = require('express')();
const winston = require('winston');
const config = require('config');

//require('dotenv').config()
require('./startup/logging');//();
require('./startup/routes')(app);
require('./startup/connectingDB')();
//require('./startup/config')();
require('./startup/validation')();

const port = config.get('PORT');
const server = app.listen(port, ()=>{
    winston.info(`listening on port ${port}...`);
});

module.exports = server;

/*
I have refactor code from .env to config.
so keep in mind the error of .env file.
*/
