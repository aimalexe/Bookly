const { User } = require('../models/userSchema');
const validateRequests = require('../middlewares/validateRequestsMiddleware')
const router = require('express').Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');

router.post('/', validateRequests(validate),async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password.");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("Invalid email or password.");

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send(_.pick(user, ['_id', 'name', 'email', 'isAdmin']));
});

function validate(req) {
    const validateReq = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    })
    return validateReq.validate(req);        
};


module.exports = router;