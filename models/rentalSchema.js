const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    customer : {
        type: new mongoose.Schema({
            name:{
                type: String,
                minlength: 3,
                maxLength: 20,
                required: true,
            },
            isGold: {
                type: Boolean,
                default: false
            },
            phoneNo:{
                type: String,
                minlength:7,
                maxLength:14,
                required: true
            }
        }),
        required: true
    },
    book:{
        type: new mongoose.Schema({
            bookName: {
                type: String,
                required: true,
                trim: true,
                minlength: 3,
                maxlength: 255
            },
            dailyRentalRate: { 
                type: Number, 
                required: true,
                min: 0,
                max: 255
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        default: Date.now,
        required: true
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

function validateRental (rental){
    const rentalValidation = Joi.object({
        customerId : Joi
            .objectId()
            .required(),
        bookId: Joi
            .objectId()
            .required()
    });
    return rentalValidation.validate(rental);
}
const Rental = mongoose.model("Rental", rentalSchema);

exports.Rental = Rental;
exports.validate = validateRental;
