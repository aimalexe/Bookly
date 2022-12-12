const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const moment = require('moment');

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

//Defining a static method to easily search for a rental.
rentalSchema.statics.lookup = function(customerId, bookId){
    return this.findOne({
        'customer._id': customerId,
        'book._id': bookId
    });
}

//Defining instance method for that object to set dateReturned and calculat rentalFee
rentalSchema.methods.calcRentalFee = function(){
    this.dateReturned = new Date();

    const rentedForDays = moment().diff(this.dateOut, "days");
    this.rentalFee = rentedForDays * this.book.dailyRentalRate;
}

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
