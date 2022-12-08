const express = require('express');
const books = require('../routes/books');
const customers = require('../routes/customers');
const genre = require('../routes/genre');
//const rentals = require('../routes/rentals');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middlewares/errorMiddleware');

module.exports = function(app){
    app.use(express.json());
    app.use("/api/genre", genre);
    app.use("/api/customers", customers);
    app.use("/api/books", books);
    //app.use("/api/rentals", rentals );
    app.use("/api/users", users);
    app.use("/api/auth", auth);
    app.use(error);
}