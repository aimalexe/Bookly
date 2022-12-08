const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
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
});

function validateCustomer (customer){
    const customerValidation = Joi.object({
        name: Joi
            .string()
            .min(3)
            .max(20)
            .required(),
        isGold: Joi
            .boolean()
            .default(false),
        phoneNo: Joi
            .string()
            .min(7)
            .max(14)
            .required()
    })
    return customerValidation.validate(customer);
}

const Customer = mongoose.model("Customer", customerSchema);

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
/* Can also be exported as;
    exports.Customer = Customer;
    exports.validate = validateCustomer;
*/