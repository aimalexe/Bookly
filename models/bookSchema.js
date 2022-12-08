const mongoose = require('mongoose');
const Joi = require('joi');
const { genreSchema } = require('./genreSchema')

const bookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 255
    },
    genre: {
        type: genreSchema,
        required: true
    },
    authors: [ {
        type: String,
        required: true
    }],
    numberInStock: { 
        type: Number, 
        required: true,
        min: 0,
        max: 255
    },
    dailyRentalRate: { 
        type: Number, 
        required: true,
        min: 0,
        max: 255
    },
    pages: Number
});

function validateBook(book){
    const bookValidation = Joi.object({
        bookName: Joi
            .string()
            .min(3)
            .required(),
        genreId: Joi
            .string()
            .required(),
        authors: Joi
            .array()
            .required(),
        numberInStock: Joi
            .number()
            .min(0)
            .required(),
        dailyRentalRate: Joi
            .number()
            .min(0)
            .required(),
        pages: Joi
            .number()
    });
    return bookValidation.validate(book)
}

const Book = mongoose.model("Book", bookSchema);

exports.Book = Book;
exports.validate = validateBook;