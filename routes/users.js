const { User, validate } = require('../models/userSchema');
const validateRequests = require('../middlewares/validateRequestsMiddleware')
const router = require('express').Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');

router.get('/me', async (req, res) => {
    const me = await User.findById(req.user._id).select('-password');
    res.send(me);
})

router.post('/', validateRequests(validate),async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if(user) return res.status(400).send("User already registered!");

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt); 
    try{
        await user.save();
        const token = user.generateAuthToken();
        res.header("x-auth-token", token).send(_.pick(user, ['_id', 'name', 'email', 'isAdmin']));
    }catch(err){
        res.send(err)
    }
});

module.exports = router;