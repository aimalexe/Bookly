const { Rental } = require('../models/rentalSchema');
const { Book } = require('../models/bookSchema');
const auth = require('../middlewares/authMiddleware')
const validateRequests = require('../middlewares/validateRequestsMiddleware')
const router = require('express').Router();
const Joi = require('joi');

router.post("/", [auth, validateRequests(validate)], async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.bookId); //Static for Rental class
    if (!rental) return res.status(404).send("No such rental found.");

    if (rental.dateReturned) return res.status(400).send("Rental already processed.");
    
    rental.calcRentalFee(); //Instance for Rental class
    await rental.save();

    await Book.updateOne({ _id: req.body.bookId }, {
        $inc: { numberInStock: 1 }
    });

    res.send(rental);
});

function validate(rental) {
    const returnValidation = Joi.object({
        customerId: Joi.objectId().required(),
        bookId: Joi.objectId().required(),
    });

    return returnValidation.validate(rental);
}

module.exports = router;