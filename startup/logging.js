const winston = require('winston');
//require('winston-mongodb');
    //it stops integration testing.
require('express-async-errors');

module.exports = function(){
    winston.exceptions.handle(
        //new winston.transports.Console({colorize: true, prettyPrint: true}),
        new winston.transports.File({filename: "uncaughtException.log"})
    );
    process.on('unhandledRejection', (ex) =>{
        throw ex;
    });
    winston.add(winston.transports.File, { filename: 'logfile.log' });
    // winston.add(winston.transports.MongoDB, {
    //     db:`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@learningcluster.ikmhi23.mongodb.net/?retryWrites=true&w=majority`,
    //     level: 'info'
    // });
}