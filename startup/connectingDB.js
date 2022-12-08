const winston = require('winston')
const mongoose = require('mongoose');
const config = require('config');

module.exports = function(){
    const dataBase = config.get('db.db');
    mongoose
        .connect(dataBase)
        .then(()=> console.info(`Connected to DB:) -> ${dataBase}`))
        .catch(err => console.error(err))
}