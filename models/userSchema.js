const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey') )
}
const User = mongoose.model("User", userSchema);

function validateUser(user) {
    const userValidation = Joi.object({
        name: Joi
            .string()
            .min(3)
            .max(50)
            .required(),
        email:Joi
            .string()
            .email()
            .min(5)
            .max(255)
            .required(),
        password: Joi
            .string()
            .min(8)
            .max(1024)
            .required()
    });
    return userValidation.validate(user);
}

exports.User = User;
exports.validate = validateUser;